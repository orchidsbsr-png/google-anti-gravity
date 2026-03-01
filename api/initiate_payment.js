import Razorpay from 'razorpay';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, currency = 'INR', receipt } = req.body;

        const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;

        const instance = new Razorpay({
            key_id: key_id,
            key_secret: key_secret,
        });

        const options = {
            amount: Math.round(amount * 100), // amount in smallest currency unit
            currency,
            receipt,
        };

        const order = await instance.orders.create(options);

        res.status(200).json({ ...order, key: key_id });
    } catch (error) {
        console.error("Razorpay Init Error:", error);
        res.status(500).json({ error: error.message });
    }
}
