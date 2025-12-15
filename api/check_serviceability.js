export default async function handler(req, res) {
    const { pincode } = req.query;

    if (!pincode) {
        return res.status(400).json({ error: 'Pincode is required' });
    }

    const url = `https://staging-express.delhivery.com/c/api/pin-codes/json/?filter_codes=${pincode}`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Token ${process.env.DELHIVERY_API_TOKEN}`
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Delhivery API Error: ${response.statusText}`);
        }
        const json = await response.json();

        // Check if pincode exists in response and if "pre_paid" is "Y" (or similar logic)
        // The raw response usually looks like: { "delivery_codes": [{ "postal_code": { ... } }] }
        // For now, we return the raw response or a simplified "serviceable" flag.
        // Let's return the raw data + a simplified cost for the frontend to use.

        // Simplified Logic: If we get data back for the pincode, it's serviceable.
        // We will default shipping to ₹50 if serviceable.

        const deliveryCodes = json.delivery_codes;
        let isServiceable = false;

        if (deliveryCodes && deliveryCodes.length > 0) {
            const codeData = deliveryCodes.find(c => c.postal_code.pin == pincode);
            if (codeData) {
                // Check encoded flags if needed, e.g. "pre_paid": "Y"
                // For now, just existence implies serviceability for this basic check
                isServiceable = true;
            }
        }

        res.status(200).json({
            success: true,
            data: json,
            is_serviceable: isServiceable,
            shipping_cost: isServiceable ? 50 : 0
        });

    } catch (err) {
        console.error("Serviceability Check Error:", err);
        res.status(500).json({ error: err.message });
    }
}
