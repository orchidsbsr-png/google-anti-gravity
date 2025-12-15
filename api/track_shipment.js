export default async function handler(req, res) {
    // URL: https://track.delhivery.com/api/v1/packages/json/?waybill=...&ref_ids=...
    const { waybill, order_id } = req.query;

    if (!waybill && !order_id) {
        return res.status(400).json({ error: 'Either waybill or order_id is required' });
    }

    const baseUrl = 'https://track.delhivery.com/api/v1/packages/json/';
    const params = new URLSearchParams();

    if (waybill) params.append('waybill', waybill);
    if (order_id) params.append('ref_ids', order_id);

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
        const json = await response.json();

        if (!response.ok) {
            throw new Error(json.error || response.statusText);
        }

        res.status(200).json(json);

    } catch (err) {
        console.error("Shipment Tracking Error:", err);
        res.status(500).json({ error: err.message });
    }
}
