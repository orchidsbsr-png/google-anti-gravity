# Delhivery Integration Guide

This guide details the integration of Delhivery One B2C API into the Farm App.

## 1. Modules Implemented

### Module 1: Pre-Checkout (Serviceability)
- **Endpoint**: `GET /api/check_serviceability?pincode=XXXXXX&weight=0.5&payment_mode=Prepaid&cart_value=100`
- **File**: `api/check_serviceability.js`
- **Logic**:
  - Checks if pincode is serviceable via Delhivery API.
  - Returns `shipping_cost: 0` if `cart_value >= 500` (Free Shipping).
  - Otherwise returns calculated cost (Mocked/Simple logic implementation as per user instruction).

### Module 2: Order Creation & Waybill
- **Trigger**: Automatically triggered on **Payment Success** via `api/payment_callback.js`.
- **Logic**:
  - Verifies PhonePe payment signature.
  - Fetches Order details from Baserow using `transactionId`.
  - Creates Shipment in Delhivery System.
  - Updates Baserow Order with **AWB Number** and changes status to `Processing`.

### Module 3: Live Tracking
- **Endpoint**: `POST /api/webhooks/delhivery`
- **File**: `api/webhooks/delhivery.js`
- **Logic**:
  - Listens for status updates from Delhivery.
  - Finds Order by searching "AWB Number" in Baserow.
  - Updates "Order Status" (e.g., `Out For Delivery`, `Delivered`).

## 2. Required Database Changes (Baserow)

You must add the following fields to your **Orders** table (Table ID: `768923`):

1.  **AWB Number** (Field Type: `Text` / `Single line text`)
    - *Required for storing the waybill and tracking updates.*

2.  **Order Status** (Field Type: `Single Select`)
    - Ensure these options exist:
        - `Order Placed`
        - `Accepted`
        - `Processing` (Used when shipment is created)
        - `Out For Delivery`
        - `Delivered`
        - `Cancelled`

## 3. Configuration & Deployment

- **Env Variables**: Currently hardcoded in files for simplicity as requested, but recommended to move to Vercel Environment Variables:
  - `DELHIVERY_TOKEN`
  - `BASEROW_TOKEN`
  - `SALT_KEY` (PhonePe)

- **Webhook Setup**:
  - Go to Delhivery Developer Portal.
  - Set Webhook URL to: `https://your-app-url.vercel.app/api/webhooks/delhivery`
  - Select events: `Status Update`, `Package Scanned`, etc.

## 4. Retries & Error Handling

- If shipment creation fails, the error is logged. 
- **Recommended**: Create a "Retry Queue" view in Baserow for orders where `AWB Number` is empty but `Payment Status` is `Success`. Run a script or manual action to retry.
