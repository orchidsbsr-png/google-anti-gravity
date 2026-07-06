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
  `GET /api/shipment?action=track&waybill=...` and renders the latest scans,
  plus a Placed → Packed → On its way → Delivered progress row driven by
  `order.status` (kept fresh by the webhook + Supabase realtime).

### Module 5: Admin Shipping Actions (Admin → order → Logistics)
Track/label/cancel live in one consolidated function (`api/shipment.js`)
to stay under Vercel Hobby's 12-function limit:
- **🚀 Ship** — manifests the shipment (`api/manual_ship.js`)
- **🏷️ Label (PDF)** — `GET /api/shipment?action=label&waybill=...`
- **✖ Cancel Shipment** — `POST /api/shipment {action:'cancel', waybill}`,
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

**Webhook setup** (required for automatic status updates + push):
Delhivery scan-push is enabled by their tech team, not self-serve. Fill
their "Scan Push/Webhook Requirement document" and send it back:
- Prod API endpoint: `https://fresh-farm-himachal.vercel.app/api/webhooks/delhivery`
- Header: `x-webhook-token: <value of DELHIVERY_WEBHOOK_SECRET>` (set the
  env var in Vercel first; the handler rejects other callers)
- Method: POST · Expected response: 200 · Default payload: Yes
- The handler acks immediately (well under their 500ms timeout) and
  processes scans in the background via `waitUntil`.
- No IP whitelisting needed on our side (auth is via the header token).

## 4. Retries & Error Handling

- If manifesting succeeds at Delhivery but the Supabase write fails, the
  error message includes the AWB so it can be attached manually.
- Orders that are paid but have no `awb_number` can simply be re-shipped from
  the Admin panel — `createDelhiveryShipment` is idempotent per order.
