// Admin-only database writes.
//
// WHY THIS EXISTS: the admin panel signs in with a PIN, not with Supabase
// Auth — so the browser's Supabase client is just an anonymous visitor as
// far as the database is concerned. Once RLS was hardened (see
// SUPABASE_RLS_HARDENING.sql), every inventory/settings write from the panel
// started failing with "new row violates row-level security policy".
//
// The fix: the panel posts here instead. This route verifies the signed
// admin token and then writes with the service-role key, which bypasses RLS.
// The anon key in the browser stays read-only, which is the whole point of
// the hardening.

import { supabaseAdmin } from './_lib/supabase_admin.js';
import { requireAdmin } from './_lib/admin_token.js';

// Only these columns can ever be written from the panel — a stray field in
// the payload can't reach the database.
const SETTINGS_FIELDS = ['shop_open', 'cod_enabled', 'selling_fast_threshold', 'now_picking'];
const ORDER_FIELDS = ['status', 'cancellation_requested', 'awb_number', 'tracking_url'];

const pick = (source, fields) => {
    const out = {};
    for (const key of fields) {
        if (source?.[key] !== undefined) out[key] = source[key];
    }
    return out;
};

function cleanInventoryRow(payload = {}) {
    const varietyId = parseInt(payload.variety_id, 10);
    if (!Number.isFinite(varietyId)) throw new Error('variety_id is required');

    const row = {
        variety_id: varietyId,
        is_active: Boolean(payload.is_active ?? true),
        is_bestseller: Boolean(payload.is_bestseller ?? false),
        price_per_kg: Number(payload.price_per_kg) || 0,
        pack_sizes: Array.isArray(payload.pack_sizes)
            ? payload.pack_sizes.filter(Boolean).map(p => ({
                weight: Number(p.weight) || 0,
                stock: Number(p.stock) || 0,
                price: Number(p.price) || 0,
            }))
            : [],
        updated_at: new Date().toISOString(),
    };
    // Kept optional so a database without the column still works.
    if (payload.is_preorder !== undefined && payload.is_preorder !== null) {
        row.is_preorder = Boolean(payload.is_preorder);
    }
    return row;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!requireAdmin(req, res)) return;

    if (!supabaseAdmin) {
        return res.status(500).json({
            error: 'Server database access is not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.',
        });
    }

    const { action, payload } = req.body || {};

    try {
        switch (action) {
            case 'inventory_upsert': {
                const row = cleanInventoryRow(payload);
                const { data, error } = await supabaseAdmin
                    .from('inventory')
                    .upsert(row, { onConflict: 'variety_id' })
                    .select()
                    .maybeSingle();
                if (error) throw error;
                return res.status(200).json({ success: true, data });
            }

            case 'settings_upsert': {
                const patch = pick(payload, SETTINGS_FIELDS);
                if (Object.keys(patch).length === 0) {
                    return res.status(400).json({ error: 'Nothing to update' });
                }
                const { data, error } = await supabaseAdmin
                    .from('settings')
                    .upsert({ id: 1, ...patch, updated_at: new Date().toISOString() })
                    .select()
                    .maybeSingle();
                if (error) throw error;
                return res.status(200).json({ success: true, data });
            }

            case 'order_update': {
                const id = payload?.id;
                if (!id) return res.status(400).json({ error: 'Order id is required' });
                const patch = pick(payload.patch, ORDER_FIELDS);
                if (Object.keys(patch).length === 0) {
                    return res.status(400).json({ error: 'Nothing to update' });
                }
                // awb_number: null is meaningful (un-shipping), so pick() keeps it.
                const { data, error } = await supabaseAdmin
                    .from('orders')
                    .update({ ...patch, updated_at: new Date().toISOString() })
                    .eq('id', id)
                    .select('id')
                    .maybeSingle();
                if (error) throw error;
                if (!data) return res.status(404).json({ error: 'Order not found' });
                return res.status(200).json({ success: true, data });
            }

            case 'orders_delete_all': {
                const { data, error } = await supabaseAdmin
                    .from('orders')
                    .delete()
                    .not('id', 'is', null)
                    .select('id');
                if (error) throw error;
                return res.status(200).json({ success: true, data: { deleted: data?.length || 0 } });
            }

            default:
                return res.status(400).json({ error: `Unknown action: ${action}` });
        }
    } catch (err) {
        console.error(`[admin_db] ${action} failed:`, err);
        return res.status(500).json({ error: err.message || 'Database write failed' });
    }
}
