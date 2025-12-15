export default async function handler(req, res) {
    const { pincode, weight = 500 } = req.query; // Default 500g

    if (!pincode) {
        return res.status(400).json({ error: 'Pincode is required' });
    }

    const DELHI_TOKEN = process.env.DELHIVERY_API_TOKEN;

    // 1. Check Serviceability
    // Using Product Type 'Heavy' as requested
    const serviceUrl = `https://track.delhivery.com/api/dc/fetch/serviceability/pincode?product_type=Heavy&pincode=${pincode}`;

    try {
        const serviceRes = await fetch(serviceUrl, {
            headers: { 'Authorization': `Token ${DELHI_TOKEN}`, 'Accept': 'application/json' }
        });

        // If serviceability check itself fails (network/auth), throw
        if (!serviceRes.ok) {
            throw new Error(`Serviceability Check Failed: ${serviceRes.statusText}`);
        }

        const serviceJson = await serviceRes.json();

        // Check if serviceable (assuming 'data' availability implies serviceability for that pin)
        // Adjust logic based on actual response if needed (e.g. data.delivery_codes)
        let isServiceable = false;
        if (serviceJson && serviceJson.data) {
            // For now, if data exists for the pincode, we assume it's serviceable
            isServiceable = true;
        }

        if (!isServiceable) {
            return res.status(200).json({
                success: true,
                is_serviceable: false,
                error: 'Location not serviceable'
            });
        }

        // 2. Calculate Shipping Cost (If serviceable)
        // URL: https://track.delhivery.com/api/kinko/v1/invoice/charges/.json
        const originPin = process.env.PICKUP_PINCODE || '171206';
        const costUrl = `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=${pincode}&o_pin=${originPin}&cgm=${weight}&pt=Pre-paid`;

        const costRes = await fetch(costUrl, {
            headers: { 'Authorization': `Token ${DELHI_TOKEN}`, 'Content-Type': 'application/json' }
        });

        if (!costRes.ok) {
            // Fallback if cost calculation fails but serviceability passed
            console.error("Cost calculation failed");
            return res.status(200).json({
                success: true,
                is_serviceable: true,
                shipping_cost: 0 // Fallback or 0
            });
        }

        const costJson = await costRes.json();
        // Expected format: Array of objects. We take the first one?
        // Example: [{"total_amount": 105.0, ...}]
        let finalCost = 50; // Default fallback

        if (Array.isArray(costJson) && costJson.length > 0) {
            finalCost = costJson[0].total_amount;
        } else if (costJson.total_amount) {
            finalCost = costJson.total_amount;
        }

        res.status(200).json({
            success: true,
            is_serviceable: true,
            shipping_cost: finalCost
        });

    } catch (err) {
        console.error("Serviceability Endpoint Error:", err);
        res.status(200).json({
            success: false,
            error: err.message,
            is_serviceable: false
        });
    }
}
