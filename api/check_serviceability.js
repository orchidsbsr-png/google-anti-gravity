// Live Delhivery serviceability + shipping rate for the checkout.
// The rate is the real lane price (origin pin → destination pin) for the
// actual cart weight in grams — never a mocked or fallback number. If we
// can't get a real price, we say so instead of quoting ₹0.

const PIN_URL = 'https://track.delhivery.com/c/api/pin-codes/json/';
const RATE_URL = 'https://track.delhivery.com/api/kinko/v1/invoice/charges/.json';

export default async function handler(req, res) {
    const { pincode, weight = 500 } = req.query;

    if (!/^[1-9]\d{5}$/.test(pincode || '')) {
        return res.status(400).json({ error: 'Valid 6-digit pincode is required' });
    }

    const TOKEN = process.env.DELHIVERY_API_TOKEN;
    if (!TOKEN) {
        return res.status(500).json({ error: 'Server config error: DELHIVERY_API_TOKEN missing' });
    }

    const grams = Math.max(50, parseInt(weight, 10) || 500);
    const originPin = process.env.PICKUP_PINCODE || '171206';

    try {
        // 1. Is the destination pincode in Delhivery's delivery network?
        //    (Authoritative when available; some tokens don't have this
        //    endpoint enabled, in which case the rate call decides.)
        let codAvailable = null;
        try {
            const pinRes = await fetch(`${PIN_URL}?filter_codes=${pincode}`, {
                headers: { 'Authorization': `Token ${TOKEN}`, 'Accept': 'application/json' }
            });
            if (pinRes.ok) {
                const pinJson = await pinRes.json();
                const entry = pinJson?.delivery_codes?.[0]?.postal_code;
                if (!entry) {
                    return res.status(200).json({
                        success: true,
                        is_serviceable: false,
                        error: 'Delivery is not available to this pincode'
                    });
                }
                codAvailable = entry.cod === 'Y';
            }
        } catch (pinErr) {
            console.error('Pincode lookup unavailable, falling back to rate check:', pinErr.message);
        }

        // 2. Real lane rate for this weight
        const costUrl = `${RATE_URL}?md=S&ss=Delivered&d_pin=${pincode}&o_pin=${originPin}&cgm=${grams}&pt=Pre-paid`;
        const costRes = await fetch(costUrl, {
            headers: { 'Authorization': `Token ${TOKEN}`, 'Content-Type': 'application/json' }
        });

        if (!costRes.ok) {
            const body = await costRes.text();
            console.error(`Rate API failed (${costRes.status}) for ${originPin}->${pincode} @${grams}g:`, body.slice(0, 300));
            return res.status(200).json({
                success: false,
                is_serviceable: false,
                error: 'Could not fetch the live shipping rate. Please try again in a moment.'
            });
        }

        const costJson = await costRes.json();
        const rateEntry = Array.isArray(costJson) ? costJson[0] : costJson;
        const amount = Number(rateEntry?.total_amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            console.error('Rate API returned no usable amount:', JSON.stringify(costJson).slice(0, 300));
            return res.status(200).json({
                success: true,
                is_serviceable: false,
                error: 'Delivery is not available to this pincode'
            });
        }

        return res.status(200).json({
            success: true,
            is_serviceable: true,
            shipping_cost: Math.ceil(amount), // whole rupees
            cod_available: codAvailable,
            weight_grams: grams
        });

    } catch (err) {
        console.error('Serviceability Endpoint Error:', err);
        return res.status(200).json({
            success: false,
            is_serviceable: false,
            error: 'Could not verify delivery to this pincode. Please try again.'
        });
    }
}
