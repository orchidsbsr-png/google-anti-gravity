import crypto from 'crypto';
import { createDelhiveryShipment } from './_lib/delhivery.js';
import { db } from './_lib/firebase_admin.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        // Payment is verified.
        // Attempt to create shipment automatically.
        if (orderId) {
            // Trigger Shipment (fire-and-forget or await depending on latency preference)
            try {
                console.log(`Payment valid. Fetching order ${orderId} from Firestore...`);

                if (db) {
                    // OPTIMIZATION: Fetch from Firestore (Free)
                    const orderRef = db.collection('orders').doc(orderId);
                    const orderDoc = await orderRef.get();

                    if (orderDoc.exists) {
                        const orderData = orderDoc.data();
                        console.log(`Order found in Firestore. Triggering shipment...`);
                        await createDelhiveryShipment(orderId, orderData);
                    } else {
                        console.warn(`Order ${orderId} not found in Firestore.`);
                        await createDelhiveryShipment(orderId); // Fallback
                    }
                } else {
                    console.warn("Firestore Admin not initialized (Missing Env Var). Falling back to SheetDB.");
                    await createDelhiveryShipment(orderId); // Fallback
                }

            } catch (shippingErr) {
                console.error("Shipping auto-creation failed:", shippingErr);
                // Do NOT fail the request. Payment was successful.
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
