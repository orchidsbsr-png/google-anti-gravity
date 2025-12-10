export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { response } = req.body;

        if (!response) {
            return res.status(400).json({ error: "Missing response field" });
        }

        // Decode Base64
        const decodedString = Buffer.from(response, 'base64').toString('utf-8');
        const decodedData = JSON.parse(decodedString);

        // Print Status (Log to Vercel Console)
        console.log("PAYMENT CALLBACK RECEIVED:");
        console.log("Transaction ID:", decodedData.data.merchantTransactionId);
        console.log("Status:", decodedData.code);
        console.log("Full Data:", JSON.stringify(decodedData, null, 2));

        // Return status
        return res.status(200).json({ status: "Received", decoded: decodedData });

    } catch (error) {
        console.error("Callback Error:", error);
        return res.status(500).json({ error: "Processing failed" });
    }
}
