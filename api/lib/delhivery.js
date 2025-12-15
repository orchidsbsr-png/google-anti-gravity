
// Shared Delhivery Logic
// Used by verify_payment (auto) and manual_ship (manual)

const DELHIVERY_TOKEN = process.env.DELHIVERY_API_TOKEN;
const SHEETDB_URL = process.env.SHEETDB_URL;

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

export async function createDelhiveryShipment(orderId, providedOrder = null) {
    if (!SHEETDB_URL) throw new Error("Server Config Error: SHEETDB_URL is missing in Vercel Env Vars.");
    if (!DELHIVERY_TOKEN) throw new Error("Server Config Error: DELHIVERY_API_TOKEN is missing in Vercel Env Vars.");

    console.log(`Starting Shipment Creation for Order: ${orderId}`);

    // Normalize Order ID
    const startOrderIdRaw = String(orderId);
    const shortOrderId = startOrderIdRaw.length > 8 ? startOrderIdRaw.slice(0, 8).toUpperCase() : startOrderIdRaw.toUpperCase();

    let shipmentDetails = {};

    // OPTIMIZATION: Use provided order data (from Admin Panel) to save 1 SheetDB Call
    if (providedOrder) {
        console.log("Using provided order data (Skipping SheetDB Read)");
        const c = providedOrder.customer_details || {};
        const addr = c.address || {};

        // Flatten Items
        const itemsList = (providedOrder.cart_items || []).map(item => {
            const name = item.productName || item.varietyName || "Unknown Item";
            const qty = item.quantity || 1;
            const weight = item.quantityKg ? `${item.quantityKg}kg` : '';
            return `${qty}x ${name} ${weight}`.trim();
        }).join(", ");

        shipmentDetails = {
            name: c.name || "Customer",
            add: (typeof addr === 'object') ? `${addr.addressLine1 || ''}, ${addr.addressLine2 || ''}` : String(addr),
            pin: addr.pincode || "110001",
            city: addr.city || "Unknown",
            state: addr.state || "Unknown",
            phone: c.phone || "9999999999",
            items: itemsList
        };
    } else {
        // Fallback: Fetch from SheetDB (Costs 1 API Call)
        const searchRes = await fetch(`${SHEETDB_URL}/search?id=${shortOrderId}`);
        const searchData = await searchRes.json();

        if (!Array.isArray(searchData) || searchData.length === 0) {
            throw new Error(`Order ${shortOrderId} not found in Google Sheet`);
        }
        const orderRow = searchData[0];

        // Check if already shipped (Only possible if we fetched from sheet)
        if (orderRow.awb_number && orderRow.awb_number.length > 5) {
            console.log(`Order ${shortOrderId} already has AWB: ${orderRow.awb_number}`);
            return { success: true, awb: orderRow.awb_number, message: "Already shipped" };
        }

        shipmentDetails = {
            name: orderRow.customer_name || "Customer",
            add: orderRow.address || "Address Not Found",
            pin: orderRow.pincode || "110001",
            city: "Unknown",
            state: "Unknown",
            phone: orderRow.phone || "9999999999",
            items: orderRow.items || "Farm Fresh Goods"
        };
    }

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
                "name": shipmentDetails.name,
                "add": shipmentDetails.add,
                "pin": shipmentDetails.pin,
                "city": shipmentDetails.city,
                "state": shipmentDetails.state,
                "country": "India",
                "phone": shipmentDetails.phone,
                "order": shortOrderId,
                "payment_mode": "Prepaid",
                "products_desc": shipmentDetails.items,
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

    if (!delhiveryRes.ok || (delhiveryData.status === false)) {
        if (!delhiveryData.packages || delhiveryData.packages.length === 0) {
            throw new Error("Delhivery Refused: " + JSON.stringify(delhiveryData));
        }
    }

    const finalAwb = delhiveryData.packages && delhiveryData.packages[0] ? delhiveryData.packages[0].waybill : waybill;

    // 5. Update Google Sheet (Costs 1 API Call)
    // SheetDB Update: PATCH /api/v1/{api_id}/id/{id}
    await fetch(`${SHEETDB_URL}/id/${shortOrderId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "data": {
                "status": "Processing",
                "awb_number": finalAwb
            }
        })
    });

    return { success: true, awb: finalAwb };
}

