
// Endpoint to Update Order Status in Google Sheets via SheetDB

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { orderId, status } = req.body;
    if (!orderId || !status) {
        return res.status(400).json({ error: 'orderId and status are required' });
    }

    const SHEETDB_URL = process.env.SHEETDB_URL;

    if (!SHEETDB_URL) {
        return res.status(500).json({ error: 'Server Config Error: SHEETDB_URL is missing.' });
    }

    try {
        const shortOrderId = String(orderId).slice(0, 8).toUpperCase();
        console.log(`Updating Sheet Status for ${shortOrderId} to ${status}`);

        const response = await fetch(`${SHEETDB_URL}/id/${shortOrderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "data": {
                    "status": status
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`SheetDB Update Failed: ${errText}`);
        }

        const data = await response.json();
        return res.status(200).json({ success: true, count: data.updated });

    } catch (error) {
        console.error("SheetDB Status Update Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
