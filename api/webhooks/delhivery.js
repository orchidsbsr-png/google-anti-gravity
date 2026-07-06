
// Webhook handler for Delhivery "Scan Push" tracking updates.
//
// Enabled by filling Delhivery's Scan Push requirement document (not
// self-serve). Their default payload (requirement doc v2.0):
//   {
//     "Shipment": {
//       "Status": { "Status", "StatusDateTime", "StatusType",
//                   "StatusLocation", "Instructions" },
//       "NSLCode": "...", "ReferenceNo": "...", "AWB": "..."
//     }
//   }
//
// Delhivery drops the scan if we don't respond within 500ms, so we ack
// immediately and do the DB + push work in the background (waitUntil).
// Auth: Delhivery sends the header  x-webhook-token: <secret>  (set the
// same value in the DELHIVERY_WEBHOOK_SECRET env var and in the form).

import { waitUntil } from '@vercel/functions';
import { supabaseAdmin } from '../_lib/supabase_admin.js';
import { sendPushToUser } from '../_lib/push.js';

// Map a Delhivery scan onto the app's order statuses. Checks RTO before
// "delivered" so an "RTO Delivered" scan (returned to seller) is never
// mistaken for a customer delivery.
function mapStatus(statusText, statusType) {
    const s = String(statusText || '').toLowerCase();
    if (s.includes('rto') || s.includes('cancelled') || s.includes('returned')) return 'cancelled';
    if (s.includes('delivered')) return 'delivered';
    if (s.includes('out for delivery')) return 'out_for_delivery';
    if (s.includes('transit') || s.includes('dispatched') || s.includes('picked')) return 'processing';

    // Fall back to Delhivery status-type codes: DL = delivered, RT = return
    const t = String(statusType || '').toUpperCase();
    if (t === 'RT') return 'cancelled';
    if (t === 'DL') return 'delivered';
    return null; // Manifested / unknown scans — leave the order untouched
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

async function processUpdates(updates) {
    for (const update of updates) {
        const shipment = update.Shipment || update;
        const awb = shipment.AWB || shipment.Waybill || shipment.waybill || shipment.awb;

        const statusObj = shipment.Status || {};
        const statusText = typeof statusObj === 'object' ? statusObj.Status : statusObj;
        const instructions = typeof statusObj === 'object' ? statusObj.Instructions : '';
        const statusType = typeof statusObj === 'object' ? statusObj.StatusType : '';

        if (!awb) continue;

        console.log(`Scan for AWB ${awb}: ${statusText} (${statusType}) — ${instructions}`);

        const newStatus = mapStatus(`${statusText || ''} ${instructions || ''}`, statusType);
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

        // Never let a late scan revive a cancelled/delivered order
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
}

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const secret = process.env.DELHIVERY_WEBHOOK_SECRET;
    if (secret && req.headers['x-webhook-token'] !== secret) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!supabaseAdmin) {
        console.error('Webhook: Supabase admin client not configured');
        return res.status(500).json({ error: 'Server not configured' });
    }

    const updates = Array.isArray(req.body) ? req.body : [req.body];

    // Ack inside Delhivery's 500ms budget; process after the response.
    waitUntil(
        processUpdates(updates).catch(err => console.error('Webhook processing error:', err))
    );
    return res.status(200).json({ success: true });
}
