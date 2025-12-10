import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, mobile, transactionId: clientTxnId } = req.body;
        // Use client provided ID (Firestore ID) or generate one
        const transactionId = clientTxnId || "TXN" + Date.now();

        // 1. Credentials
        const MERCHANT_ID = "PGTESTPAYUAT";
        const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
        const SALT_INDEX = 1;
        const API_ENDPOINT = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

        // 2. Construct Payload
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: transactionId,
            merchantUserId: "MUID" + Date.now(),
            amount: Math.round(amount * 100), // in paisa
            redirectUrl: `https://fresh-farm-himachal.vercel.app/order-confirmation?transactionId=${transactionId}`,
            redirectMode: "REDIRECT",
            callbackUrl: `https://fresh-farm-himachal.vercel.app/api/payment_callback`,
            mobileNumber: mobile || "9999999999",
            paymentInstrument: {
                type: "PAY_PAGE"
            }
        };

        // 3. Convert to Base64
        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

        // 4. Generate X-VERIFY
        // SHA256(Base64Payload + "/pg/v1/pay" + SaltKey) + "###" + SaltIndex
        const stringToHash = base64Payload + "/pg/v1/pay" + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const xVerify = sha256 + "###" + SALT_INDEX;

        // 5. Send POST Request
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': xVerify,
                'X-MERCHANT-ID': MERCHANT_ID, // Required or "Key not found" error occurs
                'accept': 'application/json'
            },
            body: JSON.stringify({
                request: base64Payload
            })
        });

        const data = await response.json();

        // 6. Return redirectUrl
        if (data.success) {
            return res.status(200).json({
                success: true,
                url: data.data.instrumentResponse.redirectInfo.url,
                transactionId: transactionId
            });
        } else {
            return res.status(400).json({
                success: false,
                error: data.message,
                fullResponse: data
            });
        }

    } catch (error) {
        console.error("Init Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
