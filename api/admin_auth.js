// The admin back-office endpoint. Two jobs, one file:
//
//   POST { pin }                    -> verify the PIN, issue a session token
//   POST { action, payload }        -> perform an admin database write
//      + Authorization: Bearer <token>
//
// WHY ONE FILE: on the Vercel Hobby plan a project without a full-stack
// framework gets at most 12 Functions per deployment, and every file in api/
// is one Function. We are at exactly 12 — adding a separate route for the
// writes fails the whole build, which silently leaves production on the
// previous deployment. Keep it this way until the plan changes.
//
// WHY THE WRITES ARE HERE AT ALL: the panel signs in with a PIN, not with
// Supabase Auth, so its browser session is anonymous to Postgres and
// is_admin() is false there (see SUPABASE_RLS_HARDENING.sql). Writing
// straight from the browser fails with "new row violates row-level security
// policy". These handlers verify the PIN token and then write with the
// service-role key, which bypasses RLS. The anon key in the browser stays
// read-only, which is the point of the hardening.
//
// Set ADMIN_PIN and ADMIN_SECRET in Vercel → Project → Settings →
// Environment Variables. Both fall back to the old defaults so the portal
// doesn't lock the owner out before those are set.

import crypto from 'crypto';
import { signAdminToken, requireAdmin } from './_lib/admin_token.js';
import { supabaseAdmin } from './_lib/supabase_admin.js';

const ADMIN_PIN = process.env.ADMIN_PIN || '1234';
const SESSION_MS = 12 * 60 * 60 * 1000; // 12h admin session

if (!process.env.ADMIN_PIN || !process.env.ADMIN_SECRET) {
    console.warn('[admin_auth] ADMIN_PIN and/or ADMIN_SECRET not set in the environment — using insecure defaults. Set both in Vercel env vars.');
}

// Best-effort in-memory lockout. Resets on cold start; combined with the
// client-side cooldown that's enough friction for a solo storefront without
// needing a database just for login attempts.
const attempts = new Map(); // ip -> { count, lockUntil }
const MAX_ATTEMPTS = 6;
const LOCK_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------- sign-in

function handleLogin(req, res) {
    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    const record = attempts.get(ip) || { count: 0, lockUntil: 0 };

    if (record.lockUntil > Date.now()) {
        const waitSec = Math.ceil((record.lockUntil - Date.now()) / 1000);
        return res.status(429).json({ success: false, error: 'Too many attempts', retryAfter: waitSec });
    }

    const { pin } = req.body || {};

    if (typeof pin !== 'string' || pin.length < 4 || pin.length > 8) {
        return res.status(400).json({ success: false, error: 'Invalid PIN' });
    }

    // Constant-time-ish comparison to avoid trivial timing leaks. Compare
    // BYTE lengths — timingSafeEqual throws on a length mismatch, and a
    // multi-byte character makes character length and byte length disagree.
    const given = Buffer.from(pin, 'utf8');
    const expected = Buffer.from(ADMIN_PIN, 'utf8');
    const ok = given.length === expected.length && crypto.timingSafeEqual(given, expected);

    if (!ok) {
        record.count += 1;
        if (record.count >= MAX_ATTEMPTS) {
            record.lockUntil = Date.now() + LOCK_MS;
            record.count = 0;
        }
        attempts.set(ip, record);
        return res.status(401).json({ success: false, error: 'Incorrect PIN' });
    }

    attempts.delete(ip);
    const exp = Date.now() + SESSION_MS;
    const token = `${exp}.${signAdminToken(exp)}`;
    return res.status(200).json({ success: true, token, exp });
}

// ------------------------------------------------------------ admin writes

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

async function handleWrite(req, res, action) {
    if (!requireAdmin(req, res)) return;

    if (!supabaseAdmin) {
        return res.status(500).json({
            error: 'Server database access is not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.',
        });
    }

    const payload = req.body?.payload || {};

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
                const id = payload.id;
                if (!id) return res.status(400).json({ error: 'Order id is required' });
                // awb_number: null is meaningful (un-shipping), so pick() keeps it.
                const patch = pick(payload.patch, ORDER_FIELDS);
                if (Object.keys(patch).length === 0) {
                    return res.status(400).json({ error: 'Nothing to update' });
                }
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
        console.error(`[admin_auth] ${action} failed:`, err);
        return res.status(500).json({ error: err.message || 'Database write failed' });
    }
}

// ------------------------------------------------------------------ router

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const action = req.body?.action;
    if (action) return handleWrite(req, res, action);
    return handleLogin(req, res);
}
