
// Webhook handler for Delhivery Tracking Updates
// Register this URL in the Delhivery One portal:
//   https://<your-domain>/api/webhooks/delhivery
// Looks the order up by AWB in Supabase (awb_number is written by
// createDelhiveryShipment) and keeps order.status in sync.

import { supabaseAdmin } from '../_lib/supabase_admin.js';
import { sendPushToUser } from '../_lib/push.js';

// Map a Delhivery scan status onto the app's order statuses
// ('order_placed', 'accepted', 'processing', 'out_for_delivery', 'delivered', 'cancelled')
function mapStatus(delhiveryStatus) {
    const s = String(delhiveryStatus || '').toLowerCase();
    if (s.includes('delivered')) return 'delivered';
    if (s.includes('out for delivery')) return 'out_for_delivery';
    if (s.includes('transit') || s.includes('dispatched') || s.includes('pending')) return 'processing';
    if (s.includes('cancelled') || s.includes('rto')) return 'cancelled';
    return null; // unknown scan — leave the order untouched
}

const PUSH_MESSAGES = {
    out_for_delivery: {
        title: 'Out for delivery 🚚',
        body: 'Your harvest is on the delivery vehicle and will reach you today.'
    },
    delivered: {
        title: 'Delivered 🍎',
        body: 'Your box has arrived. Enjoy the harvest!'
    }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!supabaseAdmin) {
        console.error('Webhook: Supabase admin client not configured');
        return res.status(500).json({ error: 'Server not configured' });
    }

    try {
        // Delhivery sends either a single update or an array.
        // Field casing varies between PascalCase and snake_case.
        const updates = Array.isArray(req.body) ? req.body : [req.body];

        for (const update of updates) {
            const shipment = update.Shipment || update; // some payloads nest under Shipment
            const awb = shipment.Waybill || shipment.waybill || shipment.AWB || shipment.awb;
            const status = shipment.Status?.Status || shipment.Status || shipment.status;

            if (!awb) continue;

            console.log(`Received update for AWB ${awb}: ${status}`);

            const newStatus = mapStatus(status);
            if (!newStatus) continue;

            // 1. Find Order by AWB
            const { data: order, error: findError } = await supabaseAdmin
                .from('orders')
                .select('id, user_id, status')
                .eq('awb_number', String(awb))
                .maybeSingle();

            if (findError) {
                console.error(`Supabase lookup error for AWB ${awb}:`, findError.message);
                continue;
            }
            if (!order) {
                console.log(`Order not found for AWB ${awb}`);
                continue;
            }
            if (order.status === newStatus) continue; // no change

            // Never let a scan revive a cancelled/delivered order
            if (['cancelled', 'delivered'].includes(order.status) && newStatus === 'processing') continue;

            // 2. Update Status
            const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', order.id);

            if (updateError) {
                console.error(`Supabase update error for order ${order.id}:`, updateError.message);
                continue;
            }

            // 3. Web push for the milestones customers care about (best-effort)
            const message = PUSH_MESSAGES[newStatus];
            if (message) {
                try {
                    await sendPushToUser(order.user_id, {
                        ...message,
                        url: `/orders/${order.id}`
                    });
                } catch (pushErr) {
                    console.error('Push failed (non-fatal):', pushErr.message);
                }
            }
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
