
// Endpoint to Sync an Order to Baserow using Server-Side Env Vars
// This replaces the client-side 'baserow.js' which relies on hardcoded/insecure tokens.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { order } = req.body;
    if (!order || !order.id) {
        return res.status(400).json({ error: 'Invalid Order Data' });
    }

    const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;
    const BASEROW_TABLE_ID = process.env.BASEROW_TABLE_ID;

    if (!BASEROW_TOKEN || !BASEROW_TABLE_ID) {
        return res.status(500).json({ error: 'Server Config Error: Baserow Token/Table ID missing.' });
    }

    try {
        // Map Items
        // Same logic as baserow.js but server-side
        const itemsList = (order.cart_items || []).map(item => {
            const name = item.productName || item.varietyName || "Unknown Item";
            const qty = item.quantity || 1;
            const weight = item.quantityKg ? `${item.quantityKg}kg` : '';
            return `${qty}x ${name} ${weight}`.trim();
        }).join(", ");

        // Customer Details
        const customerName = order.customer_details?.name || "Guest";
        let addressStr = "";
        const addr = order.customer_details?.address;
        if (typeof addr === 'string') {
            addressStr = addr;
        } else if (addr) {
            addressStr = `${addr.addressLine1 || ''}, ${addr.city || ''} ${addr.pincode || ''}`;
        }
        const customerDetails = `${customerName} - ${addressStr}`;
        const shortOrderId = order.id.slice(0, 8).toUpperCase();

        const payload = {
            "Order ID": shortOrderId,
            "Customer Details": customerDetails,
            "Order Status": "Pending",
            "Items": itemsList,
            "Total Amount": order.total_price || order.totalAmount || 0
        };

        // First, check if it already exists to avoid duplicates
        const searchUrl = `https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/?user_field_names=true&search=${shortOrderId}`;
        const searchRes = await fetch(searchUrl, {
            headers: { 'Authorization': `Token ${BASEROW_TOKEN}` }
        });

        if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.count > 0) {
                return res.status(200).json({ success: true, message: 'Order already in Baserow', id: searchData.results[0].id });
            }
        }

        // Create New Row
        const createRes = await fetch(`https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/?user_field_names=true`, {
            method: "POST",
            headers: {
                "Authorization": `Token ${BASEROW_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!createRes.ok) {
            const errText = await createRes.text();
            throw new Error(`Baserow Create Failed: ${errText}`);
        }

        const data = await createRes.json();
        return res.status(200).json({ success: true, id: data.id });

    } catch (error) {
        console.error("Baserow Sync Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
