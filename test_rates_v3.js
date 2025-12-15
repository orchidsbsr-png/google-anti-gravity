
import fetch from 'node-fetch';

const API_TOKEN = "8b4de700f126771dbc70917300bef608f52b8311";
const ORIGIN = "171206";
const DEST = "400075";
const WEIGHT = 1000;
const MODE = "S";

async function test(url, method = "GET") {
    console.log(`Testing ${method} ${url}...`);
    try {
        const options = {
            method: method,
            headers: {
                'Authorization': `Token ${API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        if (method === "POST") {
            options.body = JSON.stringify({
                md: MODE,
                cgm: WEIGHT,
                o_pin: ORIGIN,
                d_pin: DEST,
                ss: "Delivered"
            });
        }

        const response = await fetch(url, options);
        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Response: ${text.substring(0, 300)}`);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

async function run() {
    // Try POST
    await test('https://track.delhivery.com/api/kkg/service/rate-calculator', "POST");
    await test('https://track.delhivery.com/c/api/shipping/charges', "POST");

    // Try api.delhivery.com host
    await test('https://api.delhivery.com/c/api/pin-codes/json/?filter_codes=110001', "GET"); // Verify host
}

run();
