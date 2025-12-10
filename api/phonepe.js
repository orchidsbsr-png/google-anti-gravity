import crypto from 'crypto';
import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, mobile, transactionId } = req.body;

        // PHONEPE TEST CREDENTIALS
        const MERCHANT_ID = "PGTESTPAYUAT";
        const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
        const KEY_INDEX = 1;
        const TARGET_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

        // Define Payload
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: transactionId,
            merchantUserId: "MUID" + Date.now(),
            amount: amount * 100, // Amount in paise
            redirectUrl: `https://fresh-farm-himachal.vercel.app/order-confirmation?transactionId=${transactionId}`,
            redirectMode: "REDIRECT",
            callbackUrl: `https://fresh-farm-himachal.vercel.app/api/status`,
            mobileNumber: mobile || "9999999999",
            paymentInstrument: {
                type: "PAY_PAGE"
            }
        };

        // Encode Payload to Base64
        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

        // Checksum
        const stringToHash = base64Payload + "/pg/v1/pay" + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = sha256 + "###" + KEY_INDEX;

        // Make API Call to PhonePe using Axios
        const options = {
            method: 'post',
            url: TARGET_URL,
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'accept': 'application/json'
            },
            data: {
                request: base64Payload
            }
        };

        const response = await axios.request(options);
        const data = response.data;

        if (data.success) {
            const url = data.data.instrumentResponse.redirectInfo.url;
            return res.status(200).json({ success: true, url: url });
        } else {
            return res.status(400).json({ success: false, error: data.message || "Payment initiation failed at Gateway" });
        }

    } catch (error) {
        console.error("PhonePe Error:", error.response ? error.response.data : error.message);
        return res.status(500).json({
            success: false,
            error: error.response?.data?.message || error.message
        });
    }
}
