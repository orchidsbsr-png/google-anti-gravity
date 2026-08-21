// Shared admin session token: `<expiryMs>.<hmac>`, issued by /api/admin_auth
// after a correct PIN and presented back as `Authorization: Bearer <token>`
// on admin-only routes. The secret never leaves the server, so a token can't
// be forged in the browser.

import crypto from 'crypto';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'naliban-farms-dev-secret-change-me';

export function signAdminToken(exp) {
    return crypto.createHmac('sha256', ADMIN_SECRET).update(String(exp)).digest('hex');
}

export function isValidAdminToken(token) {
    if (typeof token !== 'string' || !token.includes('.')) return false;
    const [expPart, signature] = token.split('.');
    const exp = Number(expPart);
    if (!Number.isFinite(exp) || exp <= Date.now()) return false;
    if (!signature) return false;

    const given = Buffer.from(signature, 'utf8');
    const expected = Buffer.from(signAdminToken(exp), 'utf8');
    return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

// Returns true when the caller is a signed-in admin. On failure it has
// already written the 401 response, so callers just `return`.
export function requireAdmin(req, res) {
    const header = req.headers.authorization || req.headers.Authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!isValidAdminToken(token)) {
        res.status(401).json({ error: 'Admin sign-in required — enter your PIN again.' });
        return false;
    }
    return true;
}
