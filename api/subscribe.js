// Newsletter signup — stores the contact in Brevo so launch announcements
// go out through the same platform as order emails.

const BREVO_API_KEY = process.env.BREVO_API_KEY;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!BREVO_API_KEY) {
        console.error('❌ BREVO_API_KEY not set — subscription not stored');
        return res.status(500).json({ error: 'Server not configured' });
    }

    const { email, source } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
        return res.status(400).json({ error: 'A valid email is required' });
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                email: String(email).trim().toLowerCase(),
                attributes: { SOURCE: source || 'website' },
                updateEnabled: true // re-subscribing the same address is fine
            })
        });

        // 201 = created, 204 = updated existing — both are success
        if (response.status === 201 || response.status === 204) {
            return res.status(200).json({ success: true });
        }

        const detail = await response.json().catch(() => ({}));
        console.error('Brevo contact error:', response.status, detail);
        return res.status(502).json({ error: 'Could not save subscription' });
    } catch (err) {
        console.error('subscribe error:', err);
        return res.status(500).json({ error: err.message });
    }
}
