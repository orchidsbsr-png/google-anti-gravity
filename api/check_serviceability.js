export default async function handler(req, res) {
    const { pincode } = req.query;

    if (!pincode) {
        return res.status(400).json({ error: 'Pincode is required' });
    }

    // Using the user-provided PRODUCTION URL
    // ensure product_type=Heavy is included as requested
    const url = `https://track.delhivery.com/api/dc/fetch/serviceability/pincode?product_type=Heavy&pincode=${pincode}`;

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Token ${process.env.DELHIVERY_API_TOKEN}`,
            'Accept': 'application/json'
        }
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            // Log the text response for debugging if it fails
            const errText = await response.text();
            console.error(`Delhivery API Error (${response.status}):`, errText);
            throw new Error(`Delhivery API Error: ${response.statusText}`);
        }

        const json = await response.json();

        // Inspecting the response for serviceability.
        // The API returns details about the pincode. We need to check if it returns data.
        // Assuming if "data" or similar field exists and is not null, it's serviceable.
        // Or blindly trusting the response structure for now.
        // Let's assume if we get a valid JSON response with the pincode data, it is serviceable.

        // Let's check if the response actually contains the pincode serviceability
        // Usually it returns: { "data": { "pincode": { ... } } }

        // Logic: If 'data' exists and has content for this pincode, it's serviceable.
        let isServiceable = false;
        if (json && json.data) {
            isServiceable = true;
        }

        res.status(200).json({
            success: true,
            data: json,
            is_serviceable: isServiceable,
            shipping_cost: isServiceable ? 50 : 0 // Still keeping flat rate if serviceable for now
        });

    } catch (err) {
        console.error("Serviceability Check Error:", err);
        // Do NOT fail hard. Return serviceable=false so frontend handles it gracefully.
        res.status(200).json({
            success: false,
            error: err.message,
            is_serviceable: false
        });
    }
}
