
import fetch from 'node-fetch';

const API_TOKEN = "8b4de700f126771dbc70917300bef608f52b8311";
const BASE_URL = "https://track.delhivery.com";
const PINCODE = "110089";

async function test() {
    console.log("Testing Serviceability for:", PINCODE);
    const serviceUrl = `${BASE_URL}/c/api/pin-codes/json/?filter_codes=${PINCODE}`;

    try {
        const response = await fetch(serviceUrl, {
            headers: { 'Authorization': `Token ${API_TOKEN}` }
        });

        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Delivery Codes Count:", data.delivery_codes ? data.delivery_codes.length : "N/A");
        if (data.delivery_codes && data.delivery_codes.length > 0) {
            console.log("First Code:", JSON.stringify(data.delivery_codes[0], null, 2));
        } else {
            console.log("Full Data:", JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error(e);
    }
}

test();
