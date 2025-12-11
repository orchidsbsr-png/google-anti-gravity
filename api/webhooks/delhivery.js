
// Webhook handler for Delhivery Tracking Updates

const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;
const BASEROW_TABLE_ID = process.env.BASEROW_TABLE_ID;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Delhivery Payload usually: { "waybill": "123", "status": "In Transit", "scan_detail": "...", ... }
        // Or Array of updates.
        // Docs: Each update is a JSON object.

        const updates = Array.isArray(req.body) ? req.body : [req.body];

        for (const update of updates) {
            const { Waybill, Status, StatusDateTime } = update; // Case sensitivity varies, usually PascalCase or snake_case. 
            // Delhivery One typically uses: { "waybill": "...", "status": "..." } or "Waybill"
            // I'll handle both cases or log to debug.

            const awb = Waybill || update.waybill;
            const status = Status || update.status; // e.g. "In Transit", "Delivered"

            if (!awb) continue;

            console.log(`Received update for AWB ${awb}: ${status}`);

            // 1. Find Order by AWB
            // We search the 'AWB Number' field. User must have created this field in Baserow.
            const searchUrl = `https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/?user_field_names=true&search=${awb}`;
            const searchRes = await fetch(searchUrl, {
                headers: { 'Authorization': `Token ${BASEROW_TOKEN}` }
            });

            if (!searchRes.ok) {
                console.error(`Baserow Search Error: ${searchRes.statusText}`);
                continue;
            }

            const searchData = await searchRes.json();
            if (searchData.count === 0) {
                console.log(`Order not found for AWB ${awb}`);
                continue;
            }

            const orderRow = searchData.results[0];
            const rowId = orderRow.id;

            // 2. Update Status
            // Map Delhivery Status to FarmApp Status
            // Delhivery: "In Transit", "Dispatched", "Pending", "Delivered", "RTO"
            // FarmApp (Inferred): "Order Placed", "Accepted", "Processing", "Out For Delivery", "Delivered", "Cancelled"

            let newStatus = orderRow["Order Status"];
            const s = status.toLowerCase();

            if (s.includes('delivered')) newStatus = "Delivered";
            else if (s.includes('out for delivery')) newStatus = "Out For Delivery";
            else if (s.includes('transit') || s.includes('dispatched')) newStatus = "Processing";
            else if (s.includes('cancelled')) newStatus = "Cancelled";

            // Update Baserow
            await fetch(`https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/${rowId}/?user_field_names=true`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${BASEROW_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "Order Status": newStatus
                    // Optional: timestamp or history logic
                })
            });

            // Optional: Push Notification Logic
            if (newStatus === "Out For Delivery") {
                // Trigger notification (Mocked function call)
                console.log(`Triggering Notification logic for Order ${orderRow["Order ID"]}`);
            }
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
