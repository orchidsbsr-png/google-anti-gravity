
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
        const firstItem = data.delivery_codes[0];

        console.log("Type of firstItem:", typeof firstItem);
        console.log("Keys of firstItem:", Object.keys(firstItem));

        // If it has a 'postal_code' property, what is its value type?
        if (firstItem.postal_code) {
            console.log("Type of postal_code value:", typeof firstItem.postal_code);
            if (typeof firstItem.postal_code === 'object') {
                console.log("Keys of postal_code object:", Object.keys(firstItem.postal_code));
            } else {
                console.log("Value of postal_code:", firstItem.postal_code);
            }
        }
    } catch (e) {
        console.error(e);
    }
}
test();
