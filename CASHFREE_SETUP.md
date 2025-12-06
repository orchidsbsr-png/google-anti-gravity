# Cashfree Payment Integration Guide

Cashfree is an excellent alternative payment gateway for India, often easier to get approved than Razorpay!

## 🚀 Why Cashfree?

- ✅ Faster KYC approval (often same day!)
- ✅ Lower rejection rate for small businesses
- ✅ Supports UPI, Cards, Net Banking, Wallets
- ✅ Only 1.99% transaction fee (lower than Razorpay)
- ✅ Instant settlements available
- ✅ Great for startups and SMBs

## 📝 Step 1: Create Cashfree Account

1. Visit: **https://www.cashfree.com/**
2. Click **"Get Started"** or **"Sign Up"**
3. Fill in details:
   - Business Name: "Farm Fresh"
   - Email address
   - Phone number
   - Business type: Proprietorship/Partnership/Private Limited
4. Verify email & phone (OTP)

## 🔑 Step 2: Get API Credentials

### Test Mode (For Development):

1. Login to [Cashfree Dashboard](https://merchant.cashfree.com/)
2. Click **"Developers"** in left sidebar
3. Go to **"API Keys"** tab
4. You'll see:
   - **App ID**: `CFxxxxx` (Test)
   - **Secret Key**: `xxxxxxxxxxxxx`

**Copy both!** ✅

### Important:
- Test credentials work immediately (no KYC needed)
- Perfect for development and testing

## 💻 Step 3: Configure Your App

1. Create/Edit `.env` file in your project:

```bash
# Cashfree Credentials

# TEST MODE (no KYC needed)
VITE_CASHFREE_APP_ID=CFxxxxxxxxxxxxx
VITE_CASHFREE_MODE=TEST

# PRODUCTION MODE (after KYC approval)
# VITE_CASHFREE_APP_ID=CFxxxxxxxxxxxxx
# VITE_CASHFREE_MODE=PROD
```

2. **Important:** Never commit `.env` file!

## 🎯 Step 4: Test Payments

### Test Payment Methods:

**Test UPI:**
- Any UPI ID ending: `@test`
- Example: `success@test`, `fail@test`
- `success@test` → Payment success
- `fail@test` → Payment fails

**Test Cards:**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date (12/25)
OTP: 123456
```

**Test Net Banking:**
- Select any bank
- Click "Success" for successful payment
- Click "Fail" for failed payment

## 🏦 Step 5: Complete KYC (For Live Mode)

### Documents Required:

**For Proprietorship:**
- PAN Card
- Aadhar Card  
- Bank Account Details
- Cancelled Cheque/Bank Statement

**For Company:**
- Company PAN
- GST Certificate (if applicable)
- Certificate of Incorporation
- Bank Account in company name

### KYC Process:

1. Dashboard → **"Settings"** → **"Business Details"**
2. Upload documents
3. Fill business information
4. Submit for verification

**Approval Time:** Usually 2-4 hours to 1 day! ⚡

## 💰 Step 6: Add Bank Account

1. Go to **"Settlements"** section
2. Click **"Add Bank Account"**
3. Enter:
   - Bank Name
   - Account Number
   - IFSC Code
   - Account Holder Name
4. Verify with penny drop (automatic small deposit)
5. Set settlement schedule:
   - **T+1** (Next day) - Recommended
   - **T+0** (Instant) - Extra charges apply

## 🚀 Step 7: Go Live

After KYC approval:

1. Switch to **PRODUCTION** mode in dashboard
2. Generate **Live API Credentials**
3. Update `.env`:
   ```
   VITE_CASHFREE_APP_ID=CF_LIVE_xxxxx
   VITE_CASHFREE_MODE=PROD
   ```
4. Restart your app
5. Test with a small real transaction (₹10)
6. Start accepting payments! 🎉

## 💳 Payment Methods Supported

Your customers can pay via:
- **UPI** (Google Pay, PhonePe, Paytm, BHIM)
- **Credit/Debit Cards** (Visa, Mastercard, Rupay, Amex)
- **Net Banking** (All major banks)
- **Wallets** (Paytm, PhonePe Wallet, Mobikwik, etc.)
- **EMI** (Credit card EMI)
- **Cardless EMI** (ZestMoney, etc.)

## 💵 Pricing

| Feature | Cost |
|---------|------|
| Domestic Cards | 1.99% + GST |
| UPI | 1.99% + GST |
| Net Banking | 1.99% + GST |
| Wallets | 1.99% + GST |
| International Cards | 3.99% + GST |
| Setup Fee | ₹0 |
| AMC | ₹0 |

**Better than Razorpay!** 💰

## 📊 Settlement Schedule

- **T+1 Standard:** Money in bank next business day
- **T+0 Instant:** Within 30 minutes (2.5% extra fee)
- **No minimum settlement amount**

**Example:**
- Monday payment → Money by Tuesday evening
- Friday payment → Money by Monday

## 🔒 Security

- PCI DSS Level 1 Certified
- 256-bit SSL encryption
- 3D Secure
- Fraud detection & prevention
- Auto refunds & chargebacks

## 📱 Integration Features

✅ **Auto-fill customer details**
✅ **Multiple payment retries**
✅ **Automatic payment reminders**
✅ **WhatsApp payment links**
✅ **SMS payment links**
✅ **Email invoicing**

## 🐛 Common Issues

### "Invalid Credentials"
- Check App ID is correct
- Ensure Secret Key matches
- Verify MODE (TEST/PROD)
- Restart dev server

### "KYC Pending"
- Upload all required documents
- Ensure documents are clear
- Contact: care@cashfree.com

### "Settlement Delayed"
- Check bank account verified
- Verify KYC complete
- Check settlement schedule

## 📞 Support

**Cashfree Support:**
- 📧 care@cashfree.com
- 📞 +91-124-4343-434
- 💬 Live Chat (Dashboard)
- 📖 [Documentation](https://docs.cashfree.com/)

**Response Time:** Usually within 2-4 hours!

## ✅ Advantages Over Razorpay

1. ✅ **Faster KYC** (2-4 hours vs 24-48 hours)
2. ✅ **Lower fees** (1.99% vs 2%)
3. ✅ **Easier approval** for small businesses
4. ✅ **Better support** response time
5. ✅ **Instant settlements** available
6. ✅ **No hidden charges**

## 🎯 Next Steps

1. ✅ Sign up at cashfree.com
2. ✅ Get Test credentials
3. ✅ Add to `.env` file
4. ✅ Test payments
5. ✅ Complete KYC
6. ✅ Go live & earn! 💰

---

**Need help?** Check `CASHFREE_QUICKSTART.md` for 5-minute setup!
