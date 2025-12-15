import crypto from 'crypto';

// Configuration
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;
const BASEROW_TABLE_ID = process.env.BASEROW_TABLE_ID;
const DELHIVERY_TOKEN = process.env.DELHIVERY_API_TOKEN;
// Production URL
const DELHIVERY_URL = "https://track.delhivery.com/api/cmu/create.json";

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
                // Trigger Shipment (Await or fire-and-forget depends on timeouts. We await to log errors.)
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
    // "Customer Details" field format assumed "Name - AddressStr"
    // Fallback logic if parsing is tricky.
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

    // 2. Prepare Delhivery Payload (Production)
    // IMPORTANT: 'pickup_location.name' must be your registered warehouse name.
    const payload = {
        "format": "json",
        "data": JSON.stringify({
            "pickup_location": {
                "name": process.env.PICKUP_NAME || "Fresh_Farm_Himachal", // Ensure this matches exactly!
                "add": process.env.PICKUP_ADDRESS || "Himachal Pradesh",
                "pin": process.env.PICKUP_PINCODE || "171206"
            },
            "shipments": [{
                "waybill": "",
                "name": name,
                "add": address,
                "pin": "110001", // Ideally needs extraction from address or a separate field
                "city": "New Delhi", // Placeholder if not in separate field
                "state": "Delhi", // Placeholder
                "country": "India",
                "phone": "9999999999", // Placeholder, should be in DB row
                "order": orderId,
                "payment_mode": "Prepaid",
                "products_desc": orderRow["Items"] || "Farm Fresh Apples",
                "shipping_mode": "Surface",
                "total_amount": "0" // Already paid
            }]
        })
    };

    // 3. Call Delhivery API
    // Using URLSearchParams to send 'format' and 'data' as form fields is safest for this API structure
    const params = new URLSearchParams();
    params.append('format', 'json');
    params.append('data', payload.data);

    const delhiveryRes = await fetch(DELHIVERY_URL, {
        method: 'POST',
        headers: { 'Authorization': `Token ${DELHIVERY_TOKEN}` },
        body: params
    });

    const delhiveryData = await delhiveryRes.json();

    if (!delhiveryRes.ok || (delhiveryData.status === false) || !delhiveryData.packages || delhiveryData.packages.length === 0) {
        throw new Error(JSON.stringify(delhiveryData));
    }

    const awb = delhiveryData.packages[0].waybill;
    console.log(`AWB Generated: ${awb}`);

    // 4. Update Baserow with AWB
    await fetch(`https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/${rowId}/?user_field_names=true`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Token ${BASEROW_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "Order Status": "Processing",
            "AWB Number": awb
        })
    });
}
