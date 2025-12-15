
import fetch from 'node-fetch';

const API_TOKEN = "8b4de700f126771dbc70917300bef608f52b8311";
const BASE_URL = "https://track.delhivery.com";
const ORIGIN = "171206";
const DEST = "400075";
const WEIGHT = 1000; // grams
const MODE = "S"; // Surface

async function testEndpoint(name, url) {
    console.log(`Testing ${name}...`);
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Token ${API_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Response: ${text.substring(0, 500)}`); // Print first 500 chars
    } catch (e) {
        console.error(`Error ${name}:`, e.message);
    }
}

async function run() {
    // Attempt 1: KKG Rate Calculator (common internal API)
    // Query params: o_pin, d_pin, cgm, md
    const url1 = `${BASE_URL}/api/kkg/service/rate-calculator?o_pin=${ORIGIN}&d_pin=${DEST}&cgm=${WEIGHT}&md=${MODE}&pin=${DEST}`;
    await testEndpoint("KKG Rate Calc", url1);

    // Attempt 2: Generic Rate Calc (another variation)
    const url2 = `${BASE_URL}/api/cmu/rate-calculator?o_pin=${ORIGIN}&d_pin=${DEST}&cgm=${WEIGHT}&md=${MODE}`;
    await testEndpoint("CMU Rate Calc", url2);
}

run();
