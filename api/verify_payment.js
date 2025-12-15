import crypto from 'crypto';
import { createDelhiveryShipment } from './lib/delhivery.js';

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

        if (expectedSignature === razorpay_signature) {

            // Payment is verified.
            // Attempt to create shipment automatically.
            if (orderId) {
                // Trigger Shipment (fire-and-forget or await depending on latency preference)
                // We'll await it but catch errors so payment doesn't fail if shipping fails
                try {
                    console.log(`Payment valid. Triggering shipment for ${orderId}`);
                    await createDelhiveryShipment(orderId);
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
