
import fetch from 'node-fetch';

const API_TOKEN = "8b4de700f126771dbc70917300bef608f52b8311";
const BASE_URL = "https://track.delhivery.com";
const ORIGIN = "171206";
const DEST = "400075";
const WEIGHT = 1000;
const MODE = "S";

async function test(path) {
    const url = `${BASE_URL}${path}?md=${MODE}&cgm=${WEIGHT}&o_pin=${ORIGIN}&d_pin=${DEST}&ss=Delivered`;
    console.log(`Testing ${url}...`);
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Token ${API_TOKEN}` }
        });
        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Body: ${text.substring(0, 300)}`);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

async function run() {
    await test('/c/api/shipping/charges'); // Try Client API path
    await test('/api/shipping/charges');  // Try Root API path
    await test('/api/backend/shipping_charges'); // Try Backend path
}

run();
