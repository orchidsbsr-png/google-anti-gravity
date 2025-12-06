# 🚀 Quick Start: Enable Real Payments

Follow these steps to start accepting real money in your Farm Fresh app!

## ⚡ 5-Minute Setup (Test Mode)

### 1. Create Razorpay Account
```
1. Go to: https://razorpay.com/
2. Click "Sign Up"
3. Enter email & phone
4. Verify OTP
```

### 2. Get Test API Key
```
1. Login to dashboard: https://dashboard.razorpay.com/
2. Make sure you're in TEST MODE (top-left toggle)
3. Go to: Settings → API Keys
4. Click "Generate Test Key"
5. Copy your Key ID (starts with rzp_test_)
```

### 3. Add Key to Your App
```bash
# Create .env file in farm-app/ folder
cd farm-app
echo "VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE" > .env
```

### 4. Restart Dev Server
```bash
npm run dev
```

### 5. Test Payment! 🎉
```
1. Add products to cart
2. Go to checkout
3. Select payment method (Card/UPI)
4. Click "Place Order"
5. Razorpay popup opens!

Use test card:
- Card: 4111 1111 1111 1111
- CVV: 123
- Expiry: 12/25
```

---

## 💰 Go Live (Real Money)

### 1. Complete KYC
```
Dashboard → Account & Settings → KYC
Submit:
- PAN Card
- Aadhar
- Bank details
- Business proof (optional)

⏱️ Approval: 24-48 hours
```

### 2. Get Live API Key
```
1. Switch to LIVE MODE (top-left)
2. Settings → API Keys
3. Generate Live Key
4. Update .env:
   VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
```

### 3. Add Bank Account
```
Settings → Settlements
- Add bank account
- Verify with ₹1 test deposit
- Set settlement schedule (Daily recommended)
```

### 4. Deploy & Earn! 💸

---

## 📱 Payment Methods

Your customers can pay via:
- ✅ UPI (PhonePe, Google Pay, Paytm)
- ✅ Credit/Debit Cards
- ✅ Net Banking
- ✅ Wallets (Paytm, PhonePe, etc.)
- ✅ Cash on Delivery (COD)

---

## 💵 Money Flow

```
Customer pays → Razorpay → Your Bank Account
```

**Settlement Schedule:**
- **T+2 Normal** (2 business days)
- **T+0 Instant** (15 minutes, 2.5% fee)

**Example:**
- Monday sale: Money in bank by Wednesday
- Weekend sale: Money by Tuesday

---

## 💳 Fees

| Transaction Amount | Fee |
|-------------------|-----|
| ₹0 - ₹2000 | 2% + GST |
| ₹2000+ | 2% + GST |

**Example:**
- Sale: ₹1000
- Fee: ₹20 (2%)
- You get: ₹980

---

## 🛡️ Security Checklist

- ✅ Never share Key Secret
- ✅ .env added to .gitignore
- ✅ Use HTTPS in production
- ✅ Enable 2FA on dashboard
- ✅ Regular transaction monitoring

---

## 🐛 Troubleshooting

### "Razorpay SDK failed to load"
- Check internet connection
- Disable ad blockers

### "Invalid Key ID"
- Check .env file exists
- Verify key is correct
- Restart dev server

### "Payment not captured"
- Check Razorpay dashboard
- Verify webhook setup
- Check order status in Firestore

---

## 📞 Need Help?

**Razorpay Support:**
- 📧 support@razorpay.com
- 📞 +91-76-1929-1929

**Documentation:**
- 📖 https://razorpay.com/docs/

---

## ✅ Checklist

- [ ] Razorpay account created
- [ ] Test API key added to .env
- [ ] Test payment successful
- [ ] KYC submitted
- [ ] Live API key configured
- [ ] Bank account added
- [ ] First real sale! 🎊

**Ready to go live?** Switch to live mode and start earning! 💰
