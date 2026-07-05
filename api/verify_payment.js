import crypto from 'crypto';
import { createDelhiveryShipment } from './_lib/delhivery.js';
import { supabaseAdmin } from './_lib/supabase_admin.js';

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

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // Payment is verified — mark the order paid server-side, then ship.
        if (orderId && supabaseAdmin) {
            try {
                const { data: orderData, error } = await supabaseAdmin
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .maybeSingle();

                if (error) throw error;

                await supabaseAdmin
                    .from('orders')
                    .update({
                        status: 'confirmed',
                        payment_status: 'paid',
                        paid_at: new Date().toISOString(),
                        payment_details: { razorpay_order_id, razorpay_payment_id }
                    })
                    .eq('id', orderId);

                if (orderData) {
                    console.log(`Order ${orderId} found. Triggering shipment...`);
                    await createDelhiveryShipment(orderId, orderData);
                } else {
                    console.warn(`Order ${orderId} not found in Supabase.`);
                    await createDelhiveryShipment(orderId); // Fallback
                }
            } catch (shippingErr) {
                console.error("Shipping auto-creation failed:", shippingErr);
                // Do NOT fail the request. Payment was successful.
            }
        } else if (orderId) {
            console.warn("Supabase admin not initialized (missing env vars). Falling back.");
            try {
                await createDelhiveryShipment(orderId);
            } catch (shippingErr) {
                console.error("Shipping auto-creation failed:", shippingErr);
            }
        }

        res.status(200).json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ error: error.message });
    }
}
