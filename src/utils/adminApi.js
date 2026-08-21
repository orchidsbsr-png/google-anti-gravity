// Client side of /api/admin_db — every write the admin panel makes goes
// through here, carrying the PIN session token. Direct Supabase writes from
// the browser are blocked by row-level security by design.

export function getAdminToken() {
    const token = sessionStorage.getItem('admin_token');
    const exp = Number(sessionStorage.getItem('admin_token_exp') || 0);
    if (!token || exp <= Date.now()) return null;
    return token;
}

export async function adminWrite(action, payload = {}) {
    const token = getAdminToken();
    if (!token) {
        throw new Error('Admin session expired — sign in with your PIN again.');
    }

    const res = await fetch('/api/admin_db', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, payload }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
        throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data.data;
}
