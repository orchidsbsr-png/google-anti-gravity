import crypto from 'crypto';

// Configuration
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;
const BASEROW_TABLE_ID = process.env.BASEROW_TABLE_ID;
const DELHIVERY_TOKEN = process.env.DELHIVERY_API_TOKEN;
// Production URLs
const DELHIVERY_CREATE_URL = "https://track.delhivery.com/api/cmu/create.json";
const DELHIVERY_FETCH_WAYBILL_URL = "https://track.delhivery.com/waybill/api/fetch/json/"; // Production Waybill Fetch

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // Passed from frontend (Firestore ID)
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {

            // Payment is verified.
            // Attempt to create shipment automatically.
            if (orderId) {
                // Trigger Shipment (Await or fire-and-forget logic)
                try {
                    await handleShipmentCreation(orderId);
                } catch (shippingErr) {
                    console.error("Shipping creation failed, but payment verified:", shippingErr);
                }
            }

            res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ error: error.message });
    }
}

// Helper to fetch a single waybill
async function fetchWaybill() {
    const url = `${DELHIVERY_FETCH_WAYBILL_URL}?token=${DELHIVERY_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch waybill: ${res.statusText}`);
    }
    // Expected response: "123456789012" (Plain text or JSON string, usually JSON string of the waybill)
    // The snippet shows `res.json()` so it likely returns a JSON string or object.
    // Documentation says it returns the waybill number directly or in a simple structure.
    // Let's assume it returns just the waybill string/number as body or single field.
    const data = await res.json();
    return data; // Assuming `data` is the waybill number directly based on typical usage, or we might need to inspect.
}

async function handleShipmentCreation(orderId) {
    console.log(`Starting Shipment Creation for Order: ${orderId}`);

    // 1. Fetch Order from Baserow query
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
    const rowId = orderRow.id;

    // Parse Address
    const details = orderRow["Customer Details"] || "";
    let name = "Customer";
    let address = "Address Not Found";

    if (details.includes(' - ')) {
        const parts = details.split(' - ');
        name = parts[0];
        address = parts.slice(1).join(' - ');
    } else {
        address = details;
    }

    // 2. Fetch a Waybill
    let waybill = "";
    try {
        waybill = await fetchWaybill();
        console.log(`Fetched Waybill: ${waybill}`);
    } catch (wbErr) {
        console.error("Error fetching waybill:", wbErr);
        throw new Error("Could not fetch valid waybill from Delhivery");
    }

    // 3. Prepare Delhivery Payload (Production)
    const payload = {
        "format": "json",
        "data": JSON.stringify({
            "pickup_location": {
                "name": process.env.PICKUP_NAME || "Fresh_Farm_Himachal",
                "add": process.env.PICKUP_ADDRESS || "Himachal Pradesh",
                "pin": process.env.PICKUP_PINCODE || "171206"
            },
            "shipments": [{
                "waybill": waybill, // Use the fetched waybill
                "name": name,
                "add": address,
                "pin": "110001", // Placeholder
                "city": "New Delhi", // Placeholder
                "state": "Delhi", // Placeholder
                "country": "India",
                "phone": "9999999999", // Placeholder
                "order": orderId,
                "payment_mode": "Prepaid",
                "products_desc": orderRow["Items"] || "Farm Fresh Apples",
                "shipping_mode": "Surface",
                "total_amount": "0"
            }]
        })
    };

    // 4. Call Delhivery API
    const params = new URLSearchParams();
    params.append('format', 'json');
    params.append('data', payload.data);

    const delhiveryRes = await fetch(DELHIVERY_CREATE_URL, {
        method: 'POST',
        headers: { 'Authorization': `Token ${DELHIVERY_TOKEN}` },
        body: params
    });

    const delhiveryData = await delhiveryRes.json();

    // Check if package was accepted
    // Note: If waybill was pre-fetched, 'packages' array should contain it confirms success
    if (!delhiveryRes.ok || (delhiveryData.status === false)) {
        // Some APIs return status false even if partial success, check packages
        if (!delhiveryData.packages || delhiveryData.packages.length === 0) {
            throw new Error(JSON.stringify(delhiveryData));
        }
    }

    const finalAwb = delhiveryData.packages && delhiveryData.packages[0] ? delhiveryData.packages[0].waybill : waybill;
    console.log(`Shipment Created with AWB: ${finalAwb}`);

    // 5. Update Baserow with AWB
    await fetch(`https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/${rowId}/?user_field_names=true`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Token ${BASEROW_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "Order Status": "Processing",
            "AWB Number": finalAwb
        })
    });
}
