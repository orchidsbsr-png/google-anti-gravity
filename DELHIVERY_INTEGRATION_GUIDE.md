# Delhivery Integration Guide

How the Delhivery One B2C API is wired into the Farm App.
**Architecture: Supabase (orders DB) + Razorpay (payments) + optional Google Sheet mirror.**

## 1. Modules

### Module 1: Pre-Checkout Serviceability
- **Endpoint**: `GET /api/check_serviceability?pincode=XXXXXX&weight=<grams>`
- **File**: `api/check_serviceability.js`
- Called from the checkout Address step; the Continue button unlocks only
  when the pincode is serviceable. Returns the live shipping cost.

### Module 2: Shipment Creation (Manifest)
- **File**: `api/_lib/delhivery.js` → `createDelhiveryShipment(orderId, order?)`
- **Triggers**:
  - Automatically after Razorpay verification (`api/verify_payment.js`)
  - Manually from the Admin panel "🚀 Ship (Delhivery)" button (`api/manual_ship.js`)
- **Logic**:
  1. Loads the order from **Supabase** (or uses the row the Admin panel passes in).
  2. Skips if the order already has an `awb_number` (no duplicate manifests).
  3. Fetches a waybill, creates the shipment at Delhivery.
  4. Writes `awb_number` + `status: 'processing'` onto the **Supabase order** —
     this is what the webhook and the customer tracking UI rely on.
  5. Mirrors the AWB to the Google Sheet via `SHEETDB_URL` (best-effort; never
     fails the shipment).

### Module 3: Live Tracking Webhook
- **Endpoint**: `POST /api/webhooks/delhivery`
- **File**: `api/webhooks/delhivery.js`
- Finds the order in **Supabase by `awb_number`**, maps the Delhivery scan to
  the app's statuses (`processing`, `out_for_delivery`, `delivered`,
  `cancelled`), updates the row, and sends a web-push notification to the
  customer for "out for delivery" and "delivered".

### Module 4: Customer Tracking UI
- **File**: `src/pages/MyOrders.jsx`
- Orders with an AWB show a "Track Shipment" button that calls
  `GET /api/track_shipment?waybill=...` and renders the latest scans, plus a
  Placed → Packed → On its way → Delivered progress row driven by
  `order.status` (kept fresh by the webhook + Supabase realtime).

### Module 5: Admin Shipping Actions (Admin → order → Logistics)
- **🚀 Ship** — manifests the shipment (`api/manual_ship.js`)
- **🏷️ Label (PDF)** — packing slip via `api/generate_label.js`
- **✖ Cancel Shipment** — cancels at Delhivery via `api/cancel_shipment.js`,
  then clears `awb_number` and resets the order to `confirmed` so it can be
  re-shipped.

## 2. Database (Supabase)

`orders.awb_number TEXT` + index — added by `SUPABASE_MIGRATIONS.sql`
(run it once in the Supabase SQL Editor if your project predates it).

## 3. Configuration

Vercel env vars (see `.env.example`):
- `DELHIVERY_API_TOKEN`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `SHEETDB_URL` (optional sheet mirror)
- `PICKUP_NAME`, `PICKUP_ADDRESS`, `PICKUP_PINCODE`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VITE_VAPID_PUBLIC_KEY` (push)

**Webhook setup** (required for live tracking):
1. Delhivery One portal → Settings → Webhooks.
2. URL: `https://fresh-farm-himachal.vercel.app/api/webhooks/delhivery`
3. Subscribe to shipment status / scan update events.

## 4. Retries & Error Handling

- If manifesting succeeds at Delhivery but the Supabase write fails, the
  error message includes the AWB so it can be attached manually.
- Orders that are paid but have no `awb_number` can simply be re-shipped from
  the Admin panel — `createDelhiveryShipment` is idempotent per order.
