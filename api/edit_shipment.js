export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Production URL
    const url = 'https://track.delhivery.com/api/p/edit';

    // Expected Payload:
    // waybill (required)
    // ...other fields (cod, phone, add, etc.)
    const { waybill, ...updates } = req.body;

    if (!waybill) {
        return res.status(400).json({ error: 'Waybill is required' });
    }

    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Token ${process.env.DELHIVERY_API_TOKEN}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            waybill,
            ...updates
        })
    };

    try {
        const response = await fetch(url, options);

        // Delhivery API might return 200 OK but with status: false in JSON
        const json = await response.json();

        // Check for specific error flags if known, otherwise return raw response
        if (!response.ok) {
            throw new Error(json.error || response.statusText);
        }

        res.status(200).json(json);

    } catch (err) {
        console.error("Shipment Edit Error:", err);
        res.status(500).json({ error: err.message });
    }
}
