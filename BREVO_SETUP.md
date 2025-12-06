# Brevo Email Integration - Secure Setup Guide

## ✅ Security Improvement
The Brevo API key is stored securely in Firebase Cloud Functions instead of the frontend code.

## 📋 Setup Instructions

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase Functions
```bash
firebase init functions
```

### 4. Install Function Dependencies
```bash
cd functions
npm install
cd ..
```

### 5. Set the Brevo API Key Securely
Run this command to store your API key in Firebase (Replace placeholders with real keys):
```bash
firebase functions:config:set brevo.apikey="YOUR_BREVO_API_KEY_HERE"
```

### 6. Deploy the Cloud Function
```bash
firebase deploy --only functions
```

## 🔒 Security Benefits
- ✅ API key is stored server-side, never exposed to clients
- ✅ Only authenticated users can trigger emails
- ✅ Function validates all inputs before processing
