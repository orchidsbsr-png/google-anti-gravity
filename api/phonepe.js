import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { amount, mobile, transactionId } = req.body;

    // PHONEPE TEST CREDENTIALS
    const MERCHANT_ID = "PGTESTPAYUAT";
    const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
    const KEY_INDEX = 1;
    const TARGET_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

    try {
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: transactionId,
            merchantUserId: "MUID" + Date.now(),
            amount: Math.round(amount * 100), // Ensure Integer
            redirectUrl: `https://fresh-farm-himachal.vercel.app/order-confirmation?transactionId=${transactionId}`,
            redirectMode: "REDIRECT",
            callbackUrl: `https://fresh-farm-himachal.vercel.app/api/status`,
            mobileNumber: mobile || "9999999999",
            paymentInstrument: {
                type: "PAY_PAGE"
            }
        };

        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
        const stringToHash = base64Payload + "/pg/v1/pay" + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = sha256 + "###" + KEY_INDEX;

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': MERCHANT_ID,
                'accept': 'application/json'
            },
            body: JSON.stringify({
                request: base64Payload
            })
        };

        const response = await fetch(TARGET_URL, options);
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("PhonePe returned non-JSON:", text);
            return res.status(500).json({ success: false, error: "Gateway returned non-JSON response", raw: text });
        }

        if (data.success) {
            const url = data.data.instrumentResponse.redirectInfo.url;
            return res.status(200).json({ success: true, url: url });
        } else {
            return res.status(400).json({
                success: false,
                error: data.message || "Gateway Error",
                debug: {
                    sentHeaders: {
                        'X-VERIFY': checksum,
                        'X-MERCHANT-ID': MERCHANT_ID
                    },
                    gatewayResponse: data
                }
            });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
