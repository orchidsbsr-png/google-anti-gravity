
import fetch from 'node-fetch';

const API_TOKEN = "8b4de700f126771dbc70917300bef608f52b8311";
const BASE_URL = "https://track.delhivery.com";
const DEST_PIN = "110089";
const ORIGIN_PIN = "171206";
const WEIGHT = 1000; // 1kg

async function testRate() {
    console.log("Testing Rate Calc...");
    const url = `${BASE_URL}/api/kkg/service/rate-calculator?pin=${DEST_PIN}&o_pin=${ORIGIN_PIN}&cgm=${WEIGHT}&mode=S`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Token ${API_TOKEN}`, 'Accept': 'application/json' }
        });

        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

testRate();
