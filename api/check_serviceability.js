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

        // Response format: { "delivery_codes": [ { "postal_code": "110001", ... } ] }
        const codes = serviceData.delivery_codes || [];
        const pinData = codes.find(c => c.postal_code.toString() === pincode.toString());

        if (!pinData) {
            return res.status(200).json({
                is_serviceable: false,
                message: `Pincode ${pincode} not serviceable (Not found in Delhivery DB)`
            });
        }

        // Check if Payment Mode is supported
        // API returns "Y" or "N"
        // Frontend sends "COD" or "Prepaid"
        const isCod = payment_mode === 'COD';
        const supported = isCod ? (pinData.cod === 'Y') : (pinData.pre_paid === 'Y');

        if (!supported) {
            return res.status(200).json({
                is_serviceable: false,
                message: `${payment_mode} not available for ${pincode}. Try Online Payment.`,
                debug: pinData
            });
        }

        // 2. Calculate Shipping Cost
        // Since Rate Calculator API is complex to integrate without correct endpoint/access,
        // we use a logic that approximates the "Surface" rate (approx 300 INR for 1kg from HP to Delhi).
        // Formula: Base 200 + (Weight * 100)

        const weightInKg = parseFloat(weight);
        const shipping_cost = 190 + (Math.ceil(weightInKg) * 90);

        return res.status(200).json({
            is_serviceable: true,
            shipping_cost: shipping_cost,
            estimated_delivery_date: "3-5 Business Days",
            district: pinData.district,
            state: pinData.state_code,
            debug_mode: payment_mode // Return what we received to verify
        });

    } catch (error) {
        console.error("Serviceability Check Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
