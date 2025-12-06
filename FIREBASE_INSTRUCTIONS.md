# How to Enable Real Google Login

Currently, the app uses a **simulated** login for development. To make it real and secure, we need to connect it to **Firebase Authentication**.

## Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** and give it a name (e.g., "Farm Fresh").
3. Disable Google Analytics (optional, makes setup faster) and click **"Create project"**.

## Step 2: Enable Google Sign-In
1. In your new project dashboard, click **"Authentication"** in the left menu.
2. Click **"Get started"**.
3. Select **"Google"** from the list of Sign-in providers.
4. Click the **Enable** switch.
5. Select your email for the "Project support email".
6. Click **"Save"**.

## Step 3: Get Your API Keys
1. Click the **Gear icon (Settings)** next to "Project Overview" in the top-left.
2. Select **"Project settings"**.
3. Scroll down to the "Your apps" section.
4. Click the **Web icon (`</>`)**.
5. Give the app a nickname (e.g., "Farm Web") and click **"Register app"**.
6. You will see a code block with `const firebaseConfig = { ... }`.
7. **Copy these values.**


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCx0DgyBzwc32CBQQt8Ffo0CjshM2zU2eE",
  authDomain: "farm-fresh-96c9f.firebaseapp.com",
  projectId: "farm-fresh-96c9f",
  storageBucket: "farm-fresh-96c9f.firebasestorage.app",
  messagingSenderId: "1069520695120",
  appId: "1:1069520695120:web:2e6b229eca328f11950655"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

## Step 4: Connect the App
Once you have the keys, we need to:
1. Install the Firebase library: `npm install firebase`
2. Create a `src/firebase.js` file with your keys.
3. Update `AuthContext.jsx` to use the real Firebase functions.

---

### ⚠️ Important Note on Data
Even with Real Login, your **Orders** and **Addresses** are currently saved in your **Browser's Local Storage**.
- This means if you login on your phone, you **won't** see the orders you made on your computer.
- To fix this, we would need to move the **Database** to Firebase (Firestore) as well.

**Let me know if you want to proceed with just Real Login or Full Cloud Sync!**
