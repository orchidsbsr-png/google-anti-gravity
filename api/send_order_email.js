// Sends the order-confirmation email for a confirmed order.
// Used by the COD flow (online payments get their email inside
// verify_payment) and as a manual retry path.

import { supabaseAdmin } from './_lib/supabase_admin.js';
import { sendOrderConfirmationEmail } from './_lib/email.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Server not configured' });
    }

    const { orderId } = req.body || {};
    if (!orderId) {
        return res.status(400).json({ error: 'orderId is required' });
    }

    try {
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Only confirmed orders get a confirmation email — the address on
        // file decides the recipient, never the caller.
        if (!['confirmed', 'processing', 'out_for_delivery', 'delivered'].includes(order.status)) {
            return res.status(400).json({ error: `Order status is '${order.status}', not confirmed yet` });
        }

        const result = await sendOrderConfirmationEmail(order, order.customer_details?.email);

        if (!result.ok) {
            return res.status(502).json({ error: `Email failed: ${result.detail}` });
        }
        return res.status(200).json({ success: true, messageId: result.messageId });

    } catch (err) {
        console.error('send_order_email error:', err);
        return res.status(500).json({ error: err.message });
    }
}
