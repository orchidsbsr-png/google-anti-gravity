# Testing Guide: Delhivery & Order Flow Demo

Since the integration is now live in your code, here is how you can test the entire flow.

## 1. Test "Pre-Checkout" Serviceability (Frontend)
1.  Go to your deployed app: `https://fresh-farm-himachal.vercel.app` (or your relevant URL).
2.  Add items to your **Cart**.
3.  Click **Proceed to Checkout**.
4.  In the **Payment Page**:
    - Select or Add an Address.
    - **Observe**: You should see "Calculating..." briefly next to "Shipping".
    - **Result**: 
        - If the Pincode is serviceable, a shipping cost (Calculated based on weight) will appear.
        - If NOT serviceable, you will see an error "Location not serviceable" and the "Pay" button will be disabled.

## 2. Test Order Creation & Waybill (Backend)
1.  Proceed to **Pay** using the "Online Payment" method (or COD if enabled for that pin).
2.  Complete the payment (Use PhonePe Sandbox credentials if in test mode).
3.  **After Success**:
    - The `api/payment_callback.js` will trigger.
    - It will automatically:
        - Create an order in **Delhivery**.
        - Generate an **AWB Number**.
        - Save this AWB to your **Baserow** database in the orders table.
4.  **Verify**: Log in to your Baserow account and check the "Orders" table. You should see a new order with a populated "AWB Number".

## 3. Test Live Tracking (Webhook)
Since you cannot easily trigger a real physical delivery scan in a demo, you can simulate a Delhivery Webhook:

**Using Postman or cURL:**
Make a POST request to your webhook URL: `https://fresh-farm-himachal.vercel.app/api/webhooks/delhivery`

**Body (JSON):**
```json
{
  "Waybill": "YOUR_GENERATED_AWB_HERE",
  "Status": "Out For Delivery",
  "StatusDateTime": "2024-12-12T10:00:00"
}
```

**Result**:
- Check your Baserow "Orders" table again.
- The "Order Status" for that row should have updated to **"Out For Delivery"**.

---
**Note**: Ensure your `.env` variables (API Tokens) are set in your Vercel Project Settings for this to work in production.
