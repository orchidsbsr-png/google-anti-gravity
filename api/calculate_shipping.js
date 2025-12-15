export default async function handler(req, res) {
    // API to calculate shipping cost
    // URL: https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?...

    const { destination_pin, weight_grams, mode = 'S' } = req.query;

    if (!destination_pin || !weight_grams) {
        return res.status(400).json({ error: 'destination_pin and weight_grams are required' });
    }

    // Origin Pincode - use env var or default to Shimla/Farm location
    const origin_pin = process.env.PICKUP_PINCODE || '171206';

    const baseUrl = 'https://track.delhivery.com/api/kinko/v1/invoice/charges/.json';
    const params = new URLSearchParams();

    params.append('md', mode); // S = Surface, E = Express
    params.append('ss', 'Delivered'); // Status source: Delivered (default for estimation)
    params.append('d_pin', destination_pin);
    params.append('o_pin', origin_pin);
    params.append('cgm', weight_grams);
    params.append('pt', 'Pre-paid'); // Default payment type

    const url = `${baseUrl}?${params.toString()}`;

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Token ${process.env.DELHIVERY_API_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(url, options);
        // Delhivery Kinko API returns Array of estimates usually
        const json = await response.json();

        if (!response.ok) {
            throw new Error(json.error || response.statusText);
        }

        res.status(200).json(json);

    } catch (err) {
        console.error("Shipping Calculation Error:", err);
        res.status(500).json({ error: err.message });
    }
}
