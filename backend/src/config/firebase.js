const admin = require('firebase-admin');
require('dotenv').config();

const path = require('path');

// Service Account can be provided via file path or environment variable
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccount = serviceAccountPath 
  ? require(path.resolve(process.cwd(), serviceAccountPath)) 
  : null;

if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('Firebase Admin initialized with service account.');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
} else {
  console.warn('Firebase Service Account not found. Firestore/Auth may not work.');
  // We don't initialize here to avoid "no-app" error on first call, 
  // but we should still let the rest of the app load.
}

const db = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;
const storage = admin.apps.length ? admin.storage() : null;

module.exports = { db, auth, storage, admin };
