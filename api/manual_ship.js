import { createDelhiveryShipment } from './_lib/delhivery.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { orderId, order } = req.body;
    if (!orderId) {
        return res.status(400).json({ error: 'orderId is required' });
    }

    try {
        const result = await createDelhiveryShipment(orderId, order);
        res.status(200).json(result);
    } catch (err) {
        console.error("Manual Shipment Error:", err);
        res.status(500).json({ error: err.message });
    }
}
