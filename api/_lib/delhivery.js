
// Shared Delhivery Logic
// Used by verify_payment (auto) and manual_ship (manual)
// Orders live in Supabase; the Google Sheet is a best-effort ops mirror.

import { supabaseAdmin } from './supabase_admin.js';

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
    if (!DELHIVERY_TOKEN) throw new Error("Server Config Error: DELHIVERY_API_TOKEN is missing in Vercel Env Vars.");
    if (!supabaseAdmin) throw new Error("Server Config Error: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in Vercel Env Vars.");

    console.log(`Starting Shipment Creation for Order: ${orderId}`);

    // Normalize Order ID (short form is what we print on the parcel / sheet)
    const startOrderIdRaw = String(orderId);
    const shortOrderId = startOrderIdRaw.length > 8 ? startOrderIdRaw.slice(0, 8).toUpperCase() : startOrderIdRaw.toUpperCase();

    // 1. Load the order (Admin passes it in; verify_payment sends only the id)
    let order = providedOrder;
    if (!order) {
        const { data, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
        if (error || !data) {
            throw new Error(`Order ${orderId} not found in Supabase: ${error?.message || 'no row'}`);
        }
        order = data;
    }

    // Already manifested? Don't create a duplicate shipment.
    if (order.awb_number && String(order.awb_number).length > 5) {
        console.log(`Order ${shortOrderId} already has AWB: ${order.awb_number}`);
        return { success: true, awb: order.awb_number, message: "Already shipped" };
    }

    const c = order.customer_details || {};
    const addr = c.address || {};

    // Flatten Items
    const itemsList = (order.cart_items || []).map(item => {
        const name = item.productName || item.varietyName || "Unknown Item";
        const qty = item.quantity || 1;
        const weight = item.quantityKg ? `${item.quantityKg}kg` : '';
        return `${qty}x ${name} ${weight}`.trim();
    }).join(", ");

    const shipmentDetails = {
        name: c.name || "Customer",
        add: (typeof addr === 'object') ? `${addr.addressLine1 || ''}, ${addr.addressLine2 || ''}` : String(addr),
        pin: addr.pincode || "110001",
        city: addr.city || "Unknown",
        state: addr.state || "Unknown",
        phone: c.phone || "9999999999",
        items: itemsList || "Farm Fresh Goods"
    };

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

    // 5. Save AWB + status to the Supabase order (source of truth —
    //    the tracking webhook looks orders up by awb_number)
    const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ awb_number: finalAwb, status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', order.id || orderId);
    if (updateError) {
        // Shipment exists at Delhivery; surface the DB failure loudly.
        throw new Error(`Shipment created (AWB ${finalAwb}) but saving to order failed: ${updateError.message}`);
    }

    // 6. Mirror to Google Sheet (best-effort; never fails the shipment)
    if (SHEETDB_URL) {
        try {
            await fetch(`${SHEETDB_URL}/id/${shortOrderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "data": {
                        "status": "Processing",
                        "awb_number": finalAwb
                    }
                })
            });
        } catch (sheetErr) {
            console.error("Sheet mirror failed (non-fatal):", sheetErr.message);
        }
    }

    return { success: true, awb: finalAwb };
}
