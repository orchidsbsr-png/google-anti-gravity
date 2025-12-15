
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

        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Full Response:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error(e);
    }
}

test();
