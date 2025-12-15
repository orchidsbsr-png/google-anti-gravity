
import fetch from 'node-fetch';

const API_TOKEN = "8b4de700f126771dbc70917300bef608f52b8311";
const ORIGIN = "171206";
const DEST = "400075"; // Mumbai
const WEIGHT = 1000;
const MODE = "S";

async function test() {
    console.log("Testing Rate Calc POST...");
    // This URL returned 200 in previous step, let's see the JSON structure
    const url = 'https://track.delhivery.com/api/kkg/service/rate-calculator';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${API_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                md: MODE,
                cgm: WEIGHT,
                o_pin: ORIGIN,
                d_pin: DEST,
                ss: "Delivered"
            })
        });

        console.log(`Status: ${response.status}`);
        const data = await response.json();
        console.log("Full JSON Response:");
        console.log(JSON.stringify(data, null, 2));

        // Check for common rate keys
        if (data.total_amount || data.rate || data.shipping_charge) {
            console.log("\n>>> FOUND RATE DATA! <<<");
        }

    } catch (e) {
        console.log("Error:", e.message);
    }
}

test();
