# Deploy Farm Fresh App - FREE Deployment Guide

Deploy your Farm Fresh app for **FREE** in less than 5 minutes!

## 🚀 Option 1: Vercel (Recommended - Easiest!)

**Why Vercel?**
- ✅ Completely FREE
- ✅ Automatic HTTPS
- ✅ Global CDN (super fast)
- ✅ Auto-deploy on git push
- ✅ Perfect for React/Vite apps
- ✅ No credit card needed

### Steps:

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy Your App
```bash
cd farm-app
vercel
```

**Follow the prompts:**
```
? Set up and deploy? Yes
? Which scope? (your account)
? Link to existing project? No
? What's your project's name? farm-fresh
? In which directory is your code? ./
? Want to override settings? No
```

#### 3. Done! 🎉

You'll get a URL like:
```
https://farm-fresh-xyz.vercel.app
```

#### 4. Add Environment Variables

```bash
# Go to Vercel dashboard or use CLI:
vercel env add VITE_CASHFREE_APP_ID
# Enter your Cashfree App ID

vercel env add VITE_CASHFREE_MODE
# Enter: PROD (for live) or TEST (for testing)

# Repeat for Firebase vars if needed
```

#### 5. Redeploy
```bash
vercel --prod
```

**Your app is LIVE!** 🚀

---

## 🌐 Option 2: Netlify

**Why Netlify?**
- ✅ FREE forever
- ✅ Drag & drop deployment
- ✅ Form handling
- ✅ Serverless functions
- ✅ Great UI

### Steps:

#### 1. Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### 2. Build Your App
```bash
cd farm-app
npm run build
```

#### 3. Login to Netlify
```bash
netlify login
```

#### 4. Deploy
```bash
netlify deploy --prod
```

**Follow prompts:**
```
? Create & configure a new site? Yes
? Team: (your account)
? Site name: farm-fresh
? Publish directory: dist
```

#### 5. Add Environment Variables

Go to: Netlify Dashboard → Site Settings → Environment Variables

Add:
```
VITE_CASHFREE_APP_ID = your_app_id
VITE_CASHFREE_MODE = PROD
```

**Done! URL:** `https://farm-fresh.netlify.app`

---

## 🔥 Option 3: Firebase Hosting (You're Already Using Firebase!)

**Why Firebase Hosting?**
- ✅ FREE (10GB hosting, 360MB/day bandwidth)
- ✅ Already using Firebase for backend
- ✅ Fast global CDN
- ✅ Custom domain support
- ✅ SSL included

### Steps:

#### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### 2. Login
```bash
firebase login
```

#### 3. Initialize Hosting
```bash
cd farm-app
firebase init hosting
```

**Answer prompts:**
```
? Use existing project? Yes
? Select project: farm-fresh-96c9f (your project)
? Public directory: dist
? Single-page app? Yes
? Auto builds & deploys with GitHub? No
```

#### 4. Build Your App
```bash
npm run build
```

#### 5. Deploy
```bash
firebase deploy --only hosting
```

**Done! URL:** `https://farm-fresh-96c9f.web.app`

#### 6. Environment Variables

Create a `.env.production` file:
```bash
VITE_CASHFREE_APP_ID=your_app_id
VITE_CASHFREE_MODE=PROD
VITE_FIREBASE_API_KEY=your_key
# etc...
```

Rebuild and redeploy:
```bash
npm run build
firebase deploy --only hosting
```

---

## 🎨 Option 4: GitHub Pages (Simplest!)

**Why GitHub Pages?**
- ✅ Totally FREE
- ✅ No sign-up needed (if you have GitHub)
- ✅ Direct from your repo
- ✅ HTTPS included

### Steps:

#### 1. Install gh-pages
```bash
cd farm-app
npm install --save-dev gh-pages
```

#### 2. Update package.json
Add to `package.json`:
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/farm-fresh",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### 3. Update vite.config.js
```javascript
export default defineConfig({
  base: '/farm-fresh/',
  // ... rest of config
})
```

#### 4. Deploy
```bash
npm run deploy
```

**Done! URL:** `https://YOUR_USERNAME.github.io/farm-fresh`

**Note:** For environment variables, you'll need to build locally with .env

---

## 📊 Comparison

| Platform | Speed | Ease | Free? | Best For |
|----------|-------|------|-------|----------|
| **Vercel** | ⚡⚡⚡ | ⭐⭐⭐ | Yes | Production apps |
| **Netlify** | ⚡⚡⚡ | ⭐⭐⭐ | Yes | Full-stack apps |
| **Firebase** | ⚡⚡ | ⭐⭐ | Yes | Firebase users |
| **GitHub Pages** | ⚡ | ⭐⭐⭐ | Yes | Simple hosting |

## 🎯 Recommended: Vercel

**For Farm Fresh:** Use **Vercel** because:
1. Easiest deployment (one command!)
2. Free SSL certificate
3. Global CDN (fast worldwide)
4. Automatic deployments
5. Perfect for Vite/React

---

## 🔒 After Deployment:

### 1. Update Payment Gateway
Go to Razorpay/Cashfree dashboard:
- Add your deployed URL
- Update webhook URLs
- Submit for KYC

### 2. Update Firebase
In Firebase Console:
- Add deployed domain to authorized domains
- Update auth settings

### 3. Test Everything
- Payment flow
- Authentication
- Cart functionality
- Order placement

### 4. Go LIVE!
Switch from TEST to PROD mode:
```bash
VITE_CASHFREE_MODE=PROD
# or
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

---

## 🚀 Quick Deploy (Vercel - 2 Commands)

```bash
# Install
npm install -g vercel

# Deploy
cd farm-app
vercel --prod
```

**That's it!** Your app is live in 2 minutes! 🎉

## 📞 Need Help?

**Vercel:** https://vercel.com/docs  
**Netlify:** https://docs.netlify.com  
**Firebase:** https://firebase.google.com/docs/hosting

---

**Ready?** Run `vercel` and your app will be live! 🚀
