
// Endpoint to Sync an Order to Google Sheets via SheetDB
// Replaces Baserow integration.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { order } = req.body;
    if (!order || !order.id) {
        return res.status(400).json({ error: 'Invalid Order Data' });
    }

    const SHEETDB_URL = process.env.SHEETDB_URL;

    if (!SHEETDB_URL) {
        return res.status(500).json({ error: 'Server Config Error: SHEETDB_URL is missing.' });
    }

    try {
        // Map Items to readable string
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

        // Prepare Payload specifically for our Google Sheet headers
        // headers: id, date, status, total, items, customer_name, phone, address, pincode, awb_number
        const payload = {
            id: order.id.slice(0, 8).toUpperCase(),
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            status: "Pending",
            total: order.total_price || 0,
            items: itemsList,
            customer_name: customerName,
            phone: order.customer_details?.phone || "",
            address: addressStr,
            pincode: addr?.pincode || "",
            awb_number: ""
        };

        // 1. Check if exists (SheetDB Search)
        // Restored to prevent duplicates causing issues
        const searchRes = await fetch(`${SHEETDB_URL}/search?id=${payload.id}`);
        const searchData = await searchRes.json();

        if (Array.isArray(searchData) && searchData.length > 0) {
            return res.status(200).json({ success: true, message: 'Order already in Sheet', id: payload.id });
        }


        // 2. Create if not exists
        const createRes = await fetch(SHEETDB_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ data: payload })
        });

        if (!createRes.ok) {
            const errText = await createRes.text();
            throw new Error(`SheetDB Create Failed: ${errText}`);
        }

        const data = await createRes.json();
        return res.status(200).json({ success: true, id: payload.id });

    } catch (error) {
        console.error("SheetDB Sync Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
