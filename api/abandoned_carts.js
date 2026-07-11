// Abandoned-cart reminder — runs daily via Vercel Cron (see vercel.json).
// Finds carts untouched for 24h+, emails the owner once per abandonment
// via Brevo, and records the send in cart_reminders so a cart is never
// nagged twice unless it changes again.
//
// Env vars needed: BREVO_API_KEY (server-side), SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY. Optional: CRON_SECRET (recommended).

import { supabaseAdmin } from './_lib/supabase_admin.js';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SITE_URL = process.env.SITE_URL || 'https://nalibanfarms.in';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function buildEmailHtml(name, items, total) {
    const rows = items.map(item => `
        <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-family:Georgia,serif;color:#1C2313;">
                ${item.quantity || 1}&times; ${item.productName || 'Fruit'} <span style="color:#83866F;">(${item.varietyName || ''} · ${item.quantityKg || ''}kg)</span>
            </td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;color:#1C2313;">
                ${formatINR((item.price || 0) * (item.quantity || 1))}
            </td>
        </tr>`).join('');

    return `
    <div style="max-width:520px;margin:0 auto;padding:32px 24px;background:#F7F4EC;font-family:Arial,sans-serif;">
        <h1 style="font-family:Georgia,serif;font-weight:normal;color:#1C2313;font-size:26px;">Your harvest is waiting 🍎</h1>
        <p style="color:#4A4F3E;line-height:1.6;">Hi ${name || 'there'},</p>
        <p style="color:#4A4F3E;line-height:1.6;">
            You left some fruit in your basket. It's still set aside for you —
            hand-picked only after you order, so nothing goes to waste.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">${rows}
            <tr>
                <td style="padding:12px 0;font-weight:bold;color:#1C2313;">Total</td>
                <td style="padding:12px 0;text-align:right;font-weight:bold;color:#1C2313;">${formatINR(total)}</td>
            </tr>
        </table>
        <a href="${SITE_URL}/cart"
           style="display:inline-block;background:#2D3319;color:#F7F4EC;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:14px;letter-spacing:1px;">
            COMPLETE MY ORDER
        </a>
        <p style="color:#83866F;font-size:12px;margin-top:28px;">
            Naliban Farms · Jubbal-Kotkhai Valley, Himachal Pradesh
        </p>
    </div>`;
}

export default async function handler(req, res) {
    // Vercel Cron sends Authorization: Bearer <CRON_SECRET> when configured
    if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase admin not configured' });
    if (!BREVO_API_KEY) return res.status(500).json({ error: 'BREVO_API_KEY not configured' });

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    try {
        // All cart lines untouched for 24h+ (a fresh line resets the whole cart's clock below)
        const { data: cartRows, error } = await supabaseAdmin
            .from('carts')
            .select('user_id, data, updated_at');
        if (error) throw new Error(error.message);

        // Group by user
        const byUser = new Map();
        for (const row of cartRows || []) {
            if (!byUser.has(row.user_id)) byUser.set(row.user_id, []);
            byUser.get(row.user_id).push(row);
        }

        let sent = 0;
        for (const [userId, rows] of byUser) {
            if (userId.startsWith('guest')) continue;

            const lastTouched = rows.map(r => r.updated_at).sort().at(-1);
            if (lastTouched > cutoff) continue; // still active

            // Already reminded since the cart last changed?
            const { data: reminder } = await supabaseAdmin
                .from('cart_reminders')
                .select('sent_at')
                .eq('user_id', userId)
                .maybeSingle();
            if (reminder && reminder.sent_at > lastTouched) continue;

            // Resolve the user's email from Supabase Auth
            const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
            const email = userData?.user?.email;
            if (userErr || !email) continue;

            const items = rows.map(r => r.data);
            const total = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
            const name = userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || '';

            const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': BREVO_API_KEY,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: 'Naliban Farms', email: 'orchids.bsr@gmail.com' },
                    to: [{ email }],
                    subject: 'Your harvest is waiting in your basket 🍎',
                    htmlContent: buildEmailHtml(name, items, total)
                })
            });

            if (!brevoRes.ok) {
                console.error(`Brevo send failed for ${email}:`, await brevoRes.text());
                continue;
            }

            await supabaseAdmin
                .from('cart_reminders')
                .upsert({ user_id: userId, sent_at: new Date().toISOString() });
            sent++;
        }

        return res.status(200).json({ success: true, sent });

    } catch (err) {
        console.error('Abandoned cart cron error:', err);
        return res.status(500).json({ error: err.message });
    }
}
