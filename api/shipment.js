// Delhivery shipment operations, consolidated into one function to stay
// within Vercel Hobby's 12-serverless-function limit.
//
//   GET  /api/shipment?action=track&waybill=...            → live scan history
//   GET  /api/shipment?action=label&waybill=...&pdf_size=  → packing slip PDF link
//   POST /api/shipment  { action: 'cancel', waybill }      → cancel the shipment
//   POST /api/shipment  { action: 'pickup', pickup_date, pickup_time,
//                         expected_package_count }         → schedule a van pickup

const TOKEN = process.env.DELHIVERY_API_TOKEN;

async function trackShipment(waybill, orderId) {
    const params = new URLSearchParams();
    if (waybill) params.append('waybill', waybill);
    if (orderId) params.append('ref_ids', orderId);

    const response = await fetch(`https://track.delhivery.com/api/v1/packages/json/?${params}`, {
        headers: {
            'Authorization': `Token ${TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || response.statusText);
    return json;
}

async function generateLabel(waybill, pdfSize = '4R') {
    const params = new URLSearchParams();
    params.append('wbns', waybill);
    params.append('pdf', 'true');
    params.append('pdf_size', pdfSize); // 4R or A4

    const response = await fetch(`https://track.delhivery.com/api/p/packing_slip?${params}`, {
        headers: {
            'Authorization': `Token ${TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || response.statusText);
    return json;
}

// Ask Delhivery to send a van to the registered warehouse. This does NOT
// create shipments — manifest orders first (Ship button), then schedule
// the pickup for the parcels waiting.
async function createPickup({ pickup_date, pickup_time, pickup_location, expected_package_count }) {
    const response = await fetch('https://track.delhivery.com/fm/request/new/', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pickup_date,                                        // 'YYYY-MM-DD'
            pickup_time,                                        // 'HH:MM:SS'
            pickup_location: pickup_location || process.env.PICKUP_NAME,
            expected_package_count
        })
    });
    const json = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(json));
    return json; // { pickup_id, incoming_center_name, ... }
}

async function cancelShipment(waybill) {
    const response = await fetch('https://track.delhivery.com/api/p/edit', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${TOKEN}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ waybill, cancellation: "true" })
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || response.statusText);
    return json;
}

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            const { action, waybill, order_id, pdf_size } = req.query;

            if (action === 'track') {
                if (!waybill && !order_id) {
                    return res.status(400).json({ error: 'Either waybill or order_id is required' });
                }
                return res.status(200).json(await trackShipment(waybill, order_id));
            }

            if (action === 'label') {
                if (!waybill) return res.status(400).json({ error: 'Waybill is required' });
                return res.status(200).json(await generateLabel(waybill, pdf_size));
            }

            return res.status(400).json({ error: `Unknown action: ${action}` });
        }

        if (req.method === 'POST') {
            const { action, waybill, pickup_date, pickup_time, pickup_location, expected_package_count } = req.body || {};

            if (action === 'cancel') {
                if (!waybill) return res.status(400).json({ error: 'Waybill is required' });
                return res.status(200).json(await cancelShipment(waybill));
            }

            if (action === 'pickup') {
                if (!pickup_date || !pickup_time || !expected_package_count) {
                    return res.status(400).json({ error: 'pickup_date, pickup_time and expected_package_count are required' });
                }
                return res.status(200).json(await createPickup({ pickup_date, pickup_time, pickup_location, expected_package_count }));
            }

            return res.status(400).json({ error: `Unknown action: ${action}` });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (err) {
        console.error(`Shipment ${req.query?.action || req.body?.action || '?'} error:`, err);
        return res.status(500).json({ error: err.message });
    }
}
