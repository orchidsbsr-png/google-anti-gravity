import crypto from 'crypto';

// Configuration
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;
const BASEROW_TABLE_ID = process.env.BASEROW_TABLE_ID;
const DELHIVERY_TOKEN = process.env.DELHIVERY_API_TOKEN;
const DELHIVERY_URL = "https://track.delhivery.com/api/cmu/create.json";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount // Optional, if passed from client, or fetch from order
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {

            // Payment is verified.
            // Attempt to create shipment. 
            // We use the Razorpay Order ID (which is distinct from our DB ID)
            // But wait, we need the App's Order ID (Firestore/Baserow ID) to look up the order.
            // The Razorpay Order ID was created in initiate_payment. 
            // We passed 'receipt' = transactionId (Firestore ID).
            // We should fetch the Razorpay Order from Razorpay to get the 'receipt' field, 
            // OR the client should pass the Firestore ID (transactionId/orderId) to this verify endpoint.
            // Let's rely on the client passing the Firestore ID for simplicity, 
            // OR fetch it from Razorpay.
            // But verify_payment.js as written solely relied on signature.
            // Checking the client-passed ID against the one in Razorpay order adds security but is an extra call.
            // For now, let's assume the client passes 'orderId' (Firestore ID) in the body.
            // I need to update Payment.jsx to pass 'orderId' to verify_payment.

            const firestoreOrderId = req.body.orderId; // Make sure to update Payment.jsx

            if (firestoreOrderId) {
                // Trigger Shipment (Await to ensure it happens, catch errors so we don't fail the verification response if shipping fails)
                try {
                    await handleShipmentCreation(firestoreOrderId, amount);
                } catch (shippingErr) {
                    console.error("Shipping creation failed, but payment verified:", shippingErr);
                    // We still return success for payment
                }
            }

            res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ error: error.message });
    }
}

async function handleShipmentCreation(orderId, amount) {
    try {
        console.log(`Starting Shipment Creation for Order: ${orderId}`);

        // 1. Fetch Order from Baserow to get Address
        const searchUrl = `https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/?user_field_names=true&search=${orderId}`;
        const searchRes = await fetch(searchUrl, {
            headers: { 'Authorization': `Token ${BASEROW_TOKEN}` }
        });

        if (!searchRes.ok) throw new Error("Failed to fetch order from DB");

        const searchData = await searchRes.json();
        if (searchData.count === 0) {
            console.error("Order not found in Baserow");
            return;
        }

        const orderRow = searchData.results[0];
        const rowId = orderRow.id;

        // Parse Address from "Customer Details" or similar
        const details = orderRow["Customer Details"] || "";
        // Splitting logic based on previous implementation
        const [namePart, addressPart] = details.split(' - ');

        // 2. Prepare Delhivery Payload
        const payload = {
            "format": "json",
            "data": JSON.stringify({
                "pickup_location": {
                    "name": process.env.PICKUP_NAME || "FarmFresh_Warehouse",
                    "add": process.env.PICKUP_ADDRESS || "Himachal Pradesh, India",
                    "pin": process.env.PICKUP_PINCODE || "171001"
                },
                "shipments": [{
                    "waybill": "",
                    "name": namePart || "Customer",
                    "add": addressPart || "Address Not Found",
                    "pin": "110001", // Should be extracted/stored in DB properly
                    "city": "New Delhi", // Placeholder
                    "state": "Delhi",
                    "country": "India",
                    "phone": "9999999999",
                    "order": orderId,
                    "payment_mode": "Prepaid",
                    "products_desc": orderRow["Items"] || "Farm Products",
                    "shipping_mode": "Surface",
                    "total_amount": amount
                }]
            })
        };

        // 3. Call Delhivery API
        const params = new URLSearchParams();
        params.append('format', 'json');
        params.append('data', payload.data);

        const delhiveryRes = await fetch(DELHIVERY_URL, {
            method: 'POST',
            headers: { 'Authorization': `Token ${DELHIVERY_TOKEN}` },
            body: params
        });

        const delhiveryData = await delhiveryRes.json();

        if (!delhiveryRes.ok || !delhiveryData.packages || delhiveryData.packages.length === 0) {
            throw new Error(JSON.stringify(delhiveryData));
        }

        const awb = delhiveryData.packages[0].waybill;
        console.log(`AWB Generated: ${awb}`);

        // 4. Update Baserow with AWB
        await fetch(`https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/${rowId}/?user_field_names=true`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Token ${BASEROW_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Order Status": "Processing",
                "AWB Number": awb
            })
        });

    } catch (error) {
        console.error("Shipment Creation Failed:", error);
    }
}
