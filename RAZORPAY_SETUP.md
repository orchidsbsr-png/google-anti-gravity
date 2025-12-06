# Razorpay Payment Integration Guide

This guide will help you set up Razorpay to accept real payments in your Farm Fresh app.

## 🚀 Step 1: Create Razorpay Account

1. Go to [https://razorpay.com/](https://razorpay.com/)
2. Click **Sign Up** (Top right)
3. Enter your details:
   - Business Name: "Farm Fresh" (or your business name)
   - Email
   - Phone Number
4. Verify your email and phone
5. Complete KYC (Know Your Customer):
   - PAN Card
   - Aadhar Card
   - Bank Account Details
   - GST (if applicable)

**Note:** KYC approval takes 24-48 hours. You can use **Test Mode** while waiting.

## 🔑 Step 2: Get API Keys

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Key** (for testing)
4. You'll get:
   - **Key ID**: `rzp_test_xxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxx` (Keep this SECRET!)

## 💻 Step 3: Add Keys to Your App

1. Create a `.env` file in your project root (if not exists):

```bash
# In: farm-app/.env

VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

**Important:** 
- Never commit `.env` to git!
- Add `.env` to `.gitignore`
- Key Secret should ONLY be used in backend (not exposed to frontend)

## 📦 Step 4: Install Razorpay SDK

Run this command in your project:

```bash
npm install razorpay
```

## 🎯 Step 5: Test Payments

Use these **test credentials** (Test Mode):

### Test Cards:
- **Card Number:** `4111 1111 1111 1111`
- **CVV:** Any 3 digits (e.g., `123`)
- **Expiry:** Any future date (e.g., `12/25`)

### Test UPI:
- **UPI ID:** `success@razorpay`
- Result: Payment Success

### Other test UPIs:
- `failure@razorpay` - Payment fails

## 🔄 Step 6: Webhook Setup (Order Status Updates)

1. In Razorpay Dashboard → **Settings** → **Webhooks**
2. Click **Create New Webhook**
3. Add your webhook URL:
   - Development: `http://localhost:5000/webhook/razorpay`
   - Production: `https://yourapp.com/webhook/razorpay`
4. Select events:
   - ✅ payment.authorized
   - ✅ payment.failed
   - ✅ payment.captured
5. Copy the **Webhook Secret**

## 🏦 Step 7: Bank Account Setup (Receive Money)

1. Go to **Settings** → **Settlements**
2. Add your bank account:
   - Account Number
   - IFSC Code
   - Account Holder Name
3. Verify with test deposit (₹1)
4. Set settlement frequency:
   - Daily (recommended)
   - Weekly
   - Monthly

## 🚀 Step 8: Go Live (Production)

Once KYC is approved:

1. In Dashboard → Switch to **Live Mode**
2. Generate **Live API Keys**:
   - Go to Settings → API Keys
   - Click **Generate Live Key**
3. Update `.env`:
   ```
   VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
   ```
4. Test a small real transaction
5. Start accepting payments! 💰

## 💳 Payment Flow

1. Customer clicks "Place Order"
2. Razorpay checkout opens
3. Customer pays via:
   - UPI (PhonePay, Google Pay, Paytm)
   - Cards (Debit/Credit)
   - Net Banking
   - Wallets
4. Payment success → Order confirmed
5. Money reaches your bank (next settlement)

## 💰 Pricing

- **2% per transaction** (for amounts > ₹2000)
- **No setup fees**
- **No annual fees**
- Settlement to your bank: Free

## 🛡️ Security Best Practices

1. ✅ Never expose Key Secret in frontend
2. ✅ Always verify payments on backend
3. ✅ Use HTTPS in production
4. ✅ Enable 2FA on Razorpay dashboard
5. ✅ Monitor transactions regularly

## 📞 Support

- **Email:** support@razorpay.com
- **Phone:** +91-76-1929-1929
- **Docs:** https://razorpay.com/docs/

## 🎓 Next Steps

1. Complete Razorpay signup
2. Get Test API keys
3. Test payments in your app
4. Complete KYC
5. Switch to Live mode
6. Start earning! 🎉

---

**Need help?** Check the implementation in `src/services/razorpay.js`
