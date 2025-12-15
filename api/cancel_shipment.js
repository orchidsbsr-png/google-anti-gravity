export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Production URL (Same as Edit)
    const url = 'https://track.delhivery.com/api/p/edit';

    // Payload: waybill (required)
    const { waybill } = req.body;

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
            cancellation: "true"
        })
    };

    try {
        const response = await fetch(url, options);
        const json = await response.json();

        if (!response.ok) {
            throw new Error(json.error || response.statusText);
        }

        // Response handling could be improved based on specific Delhivery structure
        res.status(200).json(json);

    } catch (err) {
        console.error("Shipment Cancellation Error:", err);
        res.status(500).json({ error: err.message });
    }
}
