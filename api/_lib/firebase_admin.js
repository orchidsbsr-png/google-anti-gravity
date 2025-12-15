
import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
            : null;

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("Firebase Admin Initialized successfully.");
        } else {
            console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT_JSON missing. Admin SDK not initialized.");
        }
    } catch (error) {
        console.error("Firebase Admin Init Error:", error);
    }
}

// Export db instance (or null if failed)
export const db = admin.apps.length ? admin.firestore() : null;
