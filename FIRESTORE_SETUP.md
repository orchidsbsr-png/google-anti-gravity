# Firebase Firestore Setup - IMPORTANT!

Your app is configured to use Firebase, but you need to set up **Firestore Database** and **Security Rules** to make data persist.

## Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **farm-fresh-96c9f**
3. Click **"Firestore Database"** in the left menu
4. Click **"Create database"**
5. Select **"Start in test mode"** (for development)
6. Choose a location (e.g., `us-central`)
7. Click **"Enable"**

## Step 2: Set Up Security Rules

After creating the database, update the security rules:

1. In Firestore Database, click the **"Rules"** tab
2. Replace the rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Inventory - anyone can read, only admins can write
    match /inventory/{document} {
      allow read: if true;
      allow write: if true; // Change to admin-only in production
    }
    
    // Settings - anyone can read, only admins can write
    match /settings/{document} {
      allow read: if true;
      allow write: if true; // Change to admin-only in production
    }
    
    // Orders - users can only access their own
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // User data - users can only access their own
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User's cart
      match /cart/{cartItem} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // User's addresses
      match /addresses/{addressId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. Click **"Publish"**

## Step 3: Verify It's Working

1. Restart your development server: `npm run dev`
2. Open the app in your browser
3. Log in to the admin panel (PIN: 1234)
4. Update some inventory
5. Refresh the page - your changes should persist!

## Check if Firestore is Connected

Open your browser's console (F12) and check for:
- ✅ No Firebase errors
- ❌ If you see "Missing or insufficient permissions", go back to Step 2

## Production Security

**IMPORTANT**: The rules above allow public write access to inventory. For production:

1. Set up admin authentication
2. Change inventory/settings rules to check for admin role
3. Example:
```javascript
match /inventory/{document} {
  allow read: if true;
  allow write: if request.auth.token.admin == true;
}
```

---

**Current Status**: 
- Firebase Project: ✅ Connected
- Authentication: ✅ Enabled  
- Firestore Database: ❓ **You need to enable this**
- Security Rules: ❓ **You need to set these up**

Once you complete Steps 1 & 2, your data will persist across refreshes!
