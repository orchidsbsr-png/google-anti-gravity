# Testing Payments Without Deployment

## ✅ Use TEST MODE on Localhost

**Good News:** You DON'T need to deploy to test payments!

Both Razorpay and Cashfree support **TEST MODE** which works on:
- ✅ http://localhost:5173 (your dev server)
- ✅ No deployment required
- ✅ Test all payment methods
- ✅ No KYC needed for testing

### How to Enable TEST Mode:

1. **Get Test Credentials:**
   - Razorpay: Dashboard → Switch to "Test Mode" (top-left toggle)
   - Cashfree: Dashboard → Already in TEST mode by default

2. **Add to .env:**
```bash
# For Cashfree (Recommended)
VITE_CASHFREE_APP_ID=CF_TEST_xxxxx
VITE_CASHFREE_MODE=TEST

# OR for Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

3. **Test on Localhost:**
```bash
npm run dev
# Visit: http://localhost:5173
# Add items, checkout, pay with test card!
```

### Test Credentials:

**Test Card (Works on localhost!):**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
Name: Test User
```

**Test UPI:**
```
UPI ID: success@razorpay (Razorpay)
UPI ID: success@test (Cashfree)
```

**Result:** Payment will succeed in test mode! ✅

## 🚀 When You Need Deployment:

You ONLY need to deploy for:
- ✅ Going LIVE (accepting real money)
- ✅ Completing KYC (they verify your website)
- ✅ Showing app to customers

For now, **TEST MODE on localhost is perfect!**

---

## 📦 Option 2: Deploy for FREE (When Ready)

When you want to go live, deploy for free:

### **Vercel** (Recommended - 2 minutes)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy (one command!)
cd farm-app
vercel

# Follow prompts (press Enter for defaults)
# Done! You get: https://farm-fresh-xyz.vercel.app
```

### **Netlify** (Alternative)

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Deploy
cd farm-app
npm run build
netlify deploy --prod

# Done! You get: https://farm-fresh-xyz.netlify.app
```

### **Firebase Hosting** (Already using Firebase)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Initialize
firebase login
firebase init hosting

# 3. Deploy
npm run build
firebase deploy

# Done! You get: https://farm-fresh.web.app
```

## 🎯 Recommended Approach:

### **For Now (Development):**
1. ✅ Use TEST MODE
2. ✅ Test on localhost
3. ✅ No deployment needed
4. ✅ Test all features

### **When Going Live:**
1. Deploy to Vercel (free, 2 minutes)
2. Submit KYC with deployed URL
3. Get approved (2-4 hours)
4. Switch to PROD mode
5. Accept real payments! 💰

## ⚡ Quick Test (No Deployment):

```bash
# 1. Create .env
echo "VITE_CASHFREE_APP_ID=CF_TEST_YOUR_ID" > .env
echo "VITE_CASHFREE_MODE=TEST" >> .env

# 2. Start dev server
npm run dev

# 3. Test payment with:
# Card: 4111 1111 1111 1111
# CVV: 123
# Expiry: 12/25
```

**Works on localhost!** No deployment needed! ✅

---

**Bottom Line:** Start with TEST MODE on localhost, deploy when ready to accept real money!
