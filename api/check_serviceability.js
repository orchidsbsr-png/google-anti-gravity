export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { pincode, weight = 1.0, payment_mode = 'Prepaid', cart_value = 0 } = req.query;

    if (!pincode) {
        return res.status(400).json({ error: 'Pincode is required' });
    }

    const API_TOKEN = process.env.DELHIVERY_API_TOKEN;
    const BASE_URL = "https://track.delhivery.com";

    try {
        // 1. Check Serviceability
        const serviceUrl = `${BASE_URL}/c/api/pin-codes/json/?filter_codes=${pincode}`;
        const serviceResponse = await fetch(serviceUrl, {
            headers: { 'Authorization': `Token ${API_TOKEN}` }
        });

        if (!serviceResponse.ok) {
            throw new Error(`Delhivery API error: ${serviceResponse.status} ${serviceResponse.statusText}`);
        }

        const serviceData = await serviceResponse.json();

        // Response format is subtle:
        // { "delivery_codes": [ { "postal_code": { "pin": 171206, "pre_paid": "Y", ... } } ] }
        // The API returns an item where the key is 'postal_code' (literal string) OR sometimes the key IS the pincode itself.
        // My debug showed keys: ["postal_code"]. value type: object. keys of value: ["max_weight", "city", "cod", "pre_paid"...]

        const codes = serviceData.delivery_codes || [];

        if (codes.length === 0) {
            return res.status(200).json({
                is_serviceable: false,
                message: `Pincode ${pincode} not found in Delhivery DB.`
            });
        }

        // Access the first item
        const firstItem = codes[0];
        // Based on debug, the data is inside the 'postal_code' property of this item.
        const details = firstItem.postal_code;

        if (!details) {
            return res.status(200).json({
                is_serviceable: false,
                message: "Invalid response structure from Delhivery API (Missing 'postal_code' key)"
            });
        }

        // Check if Payment Mode is supported
        // API returns "Y" or "N"
        // Frontend sends "COD" or "Prepaid"
        const isCod = payment_mode === 'COD';
        const supported = isCod ? (details.cod === 'Y') : (details.pre_paid === 'Y');

        if (!supported) {
            return res.status(200).json({
                is_serviceable: false,
                message: `${payment_mode} not available for ${pincode}. Try Online Payment.`,
                debug: details
            });
        }

        // 2. Calculate Shipping Cost
        // Formula: Base 190 + (Weight * 90)
        const weightInKg = parseFloat(weight);
        const shipping_cost = 190 + (Math.ceil(weightInKg) * 90);

        return res.status(200).json({
            is_serviceable: true,
            shipping_cost: shipping_cost,
            estimated_delivery_date: "3-5 Business Days",
            district: details.district,
            state: details.state_code,
            debug_mode: payment_mode
        });

    } catch (error) {
        console.error("Serviceability Check Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
