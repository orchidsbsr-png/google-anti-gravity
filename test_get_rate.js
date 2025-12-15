
import fetch from 'node-fetch';

const API_TOKEN = "8b4de700f126771dbc70917300bef608f52b8311";
const ORIGIN = "171206";
const DEST = "400075";
const WEIGHT = 1000;
const MODE = "S";

async function test() {
    // Attempting query params approach with kkg/service as seen in some legacy integrations
    // URL from documentation often cited: GET https://track.delhivery.com/api/kkg/service/rate-calculator?
    const url = `https://track.delhivery.com/api/kkg/service/rate-calculator?md=${MODE}&cgm=${WEIGHT}&o_pin=${ORIGIN}&d_pin=${DEST}`;

    console.log(`Testing GET ${url}...`);
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Token ${API_TOKEN}` }
        });
        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Response start: ${text.substring(0, 100)}`);
    } catch (e) { console.error(e); }
}

test();
