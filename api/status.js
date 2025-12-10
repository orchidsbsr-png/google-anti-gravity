import crypto from 'crypto';
import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { transactionId, merchantId } = req.body;

    const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
    const KEY_INDEX = 1;
    const MERCHANT_ID = merchantId || "PGTESTPAYUAT";

    // SHA256("/pg/v1/status/{merchantId}/{merchantTransactionId}" + saltKey) + "###" + keyIndex
    const stringToHash = `/pg/v1/status/${MERCHANT_ID}/${transactionId}` + SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + "###" + KEY_INDEX;

    try {
        const response = await axios.get(`https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${MERCHANT_ID}/${transactionId}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': MERCHANT_ID,
                'accept': 'application/json'
            }
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Status Check Error:", error.response ? error.response.data : error.message);
        return res.status(500).json({ error: error.message });
    }
}
