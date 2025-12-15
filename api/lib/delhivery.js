
// Shared Delhivery Logic
// Used by verify_payment (auto) and manual_ship (manual)

const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;
const BASEROW_TABLE_ID = process.env.BASEROW_TABLE_ID;
const DELHIVERY_TOKEN = process.env.DELHIVERY_API_TOKEN;

// Production URLs
const DELHIVERY_CREATE_URL = "https://track.delhivery.com/api/cmu/create.json";
const DELHIVERY_FETCH_WAYBILL_URL = "https://track.delhivery.com/waybill/api/fetch/json/";

async function fetchWaybill() {
    const url = `${DELHIVERY_FETCH_WAYBILL_URL}?token=${DELHIVERY_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch waybill: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
}

export async function createDelhiveryShipment(orderId) {
    console.log(`Starting Shipment Creation for Order: ${orderId}`);

    // Normalize Order ID to Short Format (8 chars uppercase) to match Baserow/Admin
    const startOrderIdRaw = String(orderId);
    const shortOrderId = startOrderIdRaw.length > 8 ? startOrderIdRaw.slice(0, 8).toUpperCase() : startOrderIdRaw.toUpperCase();

    // 1. Fetch Order from Baserow
    // We search by Short Order ID
    const searchUrl = `https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/?user_field_names=true&search=${shortOrderId}`;
    const searchRes = await fetch(searchUrl, {
        headers: { 'Authorization': `Token ${BASEROW_TOKEN}` }
    });

    if (!searchRes.ok) throw new Error("Failed to fetch order from DB");

    const searchData = await searchRes.json();
    if (searchData.count === 0) {
        throw new Error(`Order ${shortOrderId} not found in Baserow`);
    }

    const orderRow = searchData.results[0];
    const rowId = orderRow.id;

    // Check if already shipped to avoid duplicates (optional but good safety)
    if (orderRow["AWB Number"] && orderRow["AWB Number"].length > 5) {
        console.log(`Order ${shortOrderId} already has AWB: ${orderRow["AWB Number"]}`);
        return { success: true, awb: orderRow["AWB Number"], message: "Already shipped" };
    }

    // Parse Address
    const details = orderRow["Customer Details"] || "";
    let name = "Customer";
    let address = "Address Not Found";
    let phone = orderRow["Phone"] || "9999999999";

    // Simple heuristic to split name/address if combined
    if (details.includes(' - ')) {
        const parts = details.split(' - ');
        name = parts[0];
        address = parts.slice(1).join(' - ');
    } else {
        address = details;
    }

    // If phone is buried in details, try to extract it (simple regex)
    const phoneMatch = details.match(/(\d{10})/);
    if (phoneMatch) phone = phoneMatch[0];

    // 2. Fetch a Waybill
    let waybill = "";
    try {
        waybill = await fetchWaybill();
    } catch (wbErr) {
        throw new Error("Could not fetch valid waybill from Delhivery: " + wbErr.message);
    }

    // 3. Prepare Delhivery Payload
    const payload = {
        "format": "json",
        "data": JSON.stringify({
            "pickup_location": {
                "name": process.env.PICKUP_NAME || "Fresh_Farm_Himachal",
                "add": process.env.PICKUP_ADDRESS || "Himachal Pradesh",
                "pin": process.env.PICKUP_PINCODE || "171206"
            },
            "shipments": [{
                "waybill": waybill,
                "name": name,
                "add": address,
                "pin": orderRow["Pincode"] || "110001", // Ideally Baserow has Pincode column
                "city": orderRow["City"] || "New Delhi",
                "state": orderRow["State"] || "Delhi",
                "country": "India",
                "phone": phone,
                "order": shortOrderId,
                "payment_mode": "Prepaid",
                "products_desc": orderRow["Items"] || "Farm Fresh Apples",
                "shipping_mode": "Surface",
                "total_amount": "0" // Prepaid
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

    if (!delhiveryRes.ok || (delhiveryData.status === false)) {
        if (!delhiveryData.packages || delhiveryData.packages.length === 0) {
            throw new Error("Delhivery Refused: " + JSON.stringify(delhiveryData));
        }
    }

    const finalAwb = delhiveryData.packages && delhiveryData.packages[0] ? delhiveryData.packages[0].waybill : waybill;

    // 5. Update Baserow
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

    return { success: true, awb: finalAwb };
}
