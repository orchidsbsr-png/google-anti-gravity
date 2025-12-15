
import fetch from 'node-fetch';

const API_TOKEN = "8b4de700f126771dbc70917300bef608f52b8311";
const BASE_URL = "https://track.delhivery.com";
const PINCODE = "171206";

async function test() {
    console.log("Testing Serviceability for:", PINCODE);
    const serviceUrl = `${BASE_URL}/c/api/pin-codes/json/?filter_codes=${PINCODE}`;

    try {
        const response = await fetch(serviceUrl, {
            headers: { 'Authorization': `Token ${API_TOKEN}` }
        });

        const data = await response.json();

        if (data.delivery_codes && data.delivery_codes.length > 0) {
            const pin = data.delivery_codes[0];
            console.log("Pincode:", pin.postal_code);
            console.log("PrePaid Status:", pin.pre_paid);
            console.log("COD Status:", pin.cod);
            console.log("Full Object Keys:", Object.keys(pin));
        } else {
            console.log("No codes found");
            console.log(JSON.stringify(data));
        }

    } catch (e) {
        console.error(e);
    }
}

test();
