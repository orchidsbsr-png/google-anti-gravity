// Admin PIN verification — runs server-side so the real PIN never ships in
// the client bundle (it used to be a hardcoded string in AdminLogin.jsx,
// readable by anyone via view-source). Set ADMIN_PIN and ADMIN_SECRET in
// Vercel → Project → Settings → Environment Variables. Falls back to the
// old default so the portal doesn't lock the owner out before those are set.

import crypto from 'crypto';

const ADMIN_PIN = process.env.ADMIN_PIN || '1234';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'naliban-farms-dev-secret-change-me';
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

function sign(exp) {
    return crypto.createHmac('sha256', ADMIN_SECRET).update(String(exp)).digest('hex');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

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

    // Constant-time-ish comparison to avoid trivial timing leaks.
    const ok = pin.length === ADMIN_PIN.length &&
        crypto.timingSafeEqual(Buffer.from(pin), Buffer.from(ADMIN_PIN));

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
    const token = `${exp}.${sign(exp)}`;
    return res.status(200).json({ success: true, token, exp });
}
