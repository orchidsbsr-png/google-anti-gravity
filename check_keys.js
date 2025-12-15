
import fetch from 'node-fetch';

const API_TOKEN = "8b4de700f126771dbc70917300bef608f52b8311";
const BASE_URL = "https://track.delhivery.com";
const PINCODE = "171206";

async function test() {
    const serviceUrl = `${BASE_URL}/c/api/pin-codes/json/?filter_codes=${PINCODE}`;
    try {
        const response = await fetch(serviceUrl, {
            headers: { 'Authorization': `Token ${API_TOKEN}` }
        });
        const data = await response.json();
        const pin = data.delivery_codes[0];
        console.log("KEYS:", JSON.stringify(Object.keys(pin)));
        console.log("FULL_OBJ:", JSON.stringify(pin));
    } catch (e) {
        console.error(e);
    }
}
test();
