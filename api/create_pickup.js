export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // API to create a pickup request
    // URL: https://track.delhivery.com/fm/request/new/

    const {
        pickup_time,
        pickup_date,
        pickup_location,
        expected_package_count
    } = req.body;

    if (!pickup_time || !pickup_date || !expected_package_count) {
        return res.status(400).json({ error: 'pickup_time, pickup_date, and expected_package_count are required' });
    }

    // Default warehouse name from env if not provided
    const warehouseName = pickup_location || process.env.PICKUP_NAME;

    const url = 'https://track.delhivery.com/fm/request/new/';
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Token ${process.env.DELHIVERY_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pickup_time, // Format: 'HH:MM:SS'
            pickup_date, // Format: 'YYYY-MM-DD'
            pickup_location: warehouseName,
            expected_package_count
        })
    };

    try {
        const response = await fetch(url, options);
        const json = await response.json();

        if (!response.ok) {
            throw new Error(json.error || response.statusText);
        }

        // Typical response: { "pickup_id": "...", "incoming_center_name": "...", ... }
        res.status(200).json(json);

    } catch (err) {
        console.error("Pickup Request Error:", err);
        res.status(500).json({ error: err.message });
    }
}
