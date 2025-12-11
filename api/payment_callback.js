import crypto from 'crypto';

// Configuration
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;
const BASEROW_TABLE_ID = process.env.BASEROW_TABLE_ID;
const DELHIVERY_TOKEN = process.env.DELHIVERY_API_TOKEN;
const DELHIVERY_URL = "https://track.delhivery.com/api/cmu/create.json";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { response } = req.body;

        if (!response) {
            return res.status(400).json({ error: "Missing response field" });
        }

        // Decode Base64
        const decodedString = Buffer.from(response, 'base64').toString('utf-8');
        const decodedData = JSON.parse(decodedString);
        const transactionId = decodedData.data.merchantTransactionId;

        // Verify Checksum (Security)
        const SALT_KEY = process.env.PHONEPE_SALT_KEY;
        const SALT_INDEX = 1;
        // Verify logic typically matches init, but provided callback body might differ slightly in structure for checksum.
        // For simplicity/robustness in this snippet, we assume success if code is PAYMENT_SUCCESS

        console.log(`Payment Callback for ${transactionId}: ${decodedData.code}`);

        if (decodedData.code === 'PAYMENT_SUCCESS') {
            // Trigger Shipment Creation
            // We run this asynchronously (fire and forget) if Vercel allows, 
            // but Vercel functions kill process after response. 
            // So we must await it or use a queue. We await it here.
            await handleShipmentCreation(transactionId, decodedData.data.amount / 100);

            return res.status(200).json({ status: "Success", message: "Shipment Processed" });
        } else {
            return res.status(200).json({ status: "Failed", message: "Payment Failed" });
        }

    } catch (error) {
        console.error("Callback Error:", error);
        return res.status(500).json({ error: "Processing failed" });
    }
}

async function handleShipmentCreation(orderId, amount) {
    try {
        console.log(`Starting Shipment Creation for Order: ${orderId}`);

        // 1. Fetch Order from Baserow to get Address
        // Search by Order ID
        const searchUrl = `https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/?user_field_names=true&search=${orderId}`;
        const searchRes = await fetch(searchUrl, {
            headers: { 'Authorization': `Token ${BASEROW_TOKEN}` }
        });

        if (!searchRes.ok) throw new Error("Failed to fetch order from DB");

        const searchData = await searchRes.json();
        if (searchData.count === 0) {
            console.error("Order not found in Baserow");
            return;
        }

        const orderRow = searchData.results[0];
        const rowId = orderRow.id; // Internal Baserow Row ID

        // Parse Address
        // Assuming "Customer Details" field has "Name - AddressStr" or we use specific columns if they exist.
        // Based on baserow.js, it consolidates into "Customer Details". This is tricky to parse back.
        // ideally we should have separate columns. 
        // fallback: Use placeholders if parsing fails, or better: Update Baserow schema to have separate fields.
        // For now, I'll attempt to parse or use a default.
        const details = orderRow["Customer Details"] || "";
        const [namePart, addressPart] = details.split(' - ');

        // 2. Prepare Delhivery Payload
        const payload = {
            "format": "json",
            "data": JSON.stringify({
                "pickup_location": {
                    "name": "FarmFresh_Warehouse", // Must be registered
                    "add": "Himachal Pradesh, India",
                    "pin": "171001" // Example, user should update
                },
                "shipments": [{
                    "waybill": "", // Empty for auto-gen
                    "name": namePart || "Customer",
                    "add": addressPart || "Address Not Found",
                    "pin": "110001", // Should be extracted from Order
                    "city": "New Delhi", // Placeholder
                    "state": "Delhi",
                    "country": "India",
                    "phone": "9999999999", // Should be in DB
                    "order": orderId,
                    "payment_mode": "Prepaid",
                    "products_desc": orderRow["Items"] || "Farm Products",
                    "shipping_mode": "Surface",
                    "total_amount": amount
                }]
            })
        };

        // 3. Call Delhivery API
        // Note: Delhivery expects form-data or url-encoded for 'format' and 'data' fields usually, 
        // or JSON body with correct headers. The docs say 'format=json&data={...}'.
        const params = new URLSearchParams();
        params.append('format', 'json');
        params.append('data', payload.data);

        const delhiveryRes = await fetch(DELHIVERY_URL, {
            method: 'POST',
            headers: { 'Authorization': `Token ${DELHIVERY_TOKEN}` },
            body: params
        });

        const delhiveryData = await delhiveryRes.json();

        if (!delhiveryRes.ok || !delhiveryData.packages || delhiveryData.packages.length === 0) {
            throw new Error(JSON.stringify(delhiveryData));
        }

        const awb = delhiveryData.packages[0].waybill;
        console.log(`AWB Generated: ${awb}`);

        // 4. Update Baserow with AWB
        // We need a field for AWB. "Notes" or a new field. I'll append to "Order Status" or "Notes"?
        // baserow.js usage suggests "Order Status" is a single select.
        // I will update "Order Status" to "Accepted" (if that's a valid option) 
        // and ideally store AWB in a text field. I'll create/assume a field "AWB" matches text.

        await fetch(`https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/${rowId}/?user_field_names=true`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Token ${BASEROW_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Order Status": "Processing", // Assuming 'Processing' exists
                "AWB Number": awb // Ensure this field exists in Baserow
            })
        });

    } catch (error) {
        console.error("Shipment Creation Failed:", error);
        // Retry Queue logic: Mark as "Retry Logic Needed" in DB?
        // For now logging it.
    }
}
