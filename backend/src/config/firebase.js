const admin = require('firebase-admin');
const fs = require('fs');
require('dotenv').config();

const path = require('path');

// Service Account can be provided via file path or environment variable
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

let serviceAccount = null;

try {
  if (serviceAccountJson) {
    serviceAccount = JSON.parse(serviceAccountJson);
  } else if (serviceAccountPath && fs.existsSync(path.resolve(process.cwd(), serviceAccountPath))) {
    serviceAccount = require(path.resolve(process.cwd(), serviceAccountPath));
  }
} catch (error) {
  console.error('Failed to parse/load service account:', error);
}

if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('Firebase Admin initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
} else {
  console.warn('Firebase Service Account not found. Firestore/Auth may not work.');
  console.warn('Hint: On hosted platforms (Render/Heroku/etc) set FIREBASE_SERVICE_ACCOUNT_JSON with the service account JSON.');
  // We don't initialize here to avoid "no-app" error on first call,
  // but we should still let the rest of the app load.
}

const db = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;
const storage = admin.apps.length ? admin.storage() : null;

// Export a flag to indicate whether Firebase Admin initialized successfully
const isFirebaseInitialized = admin.apps.length > 0;

module.exports = { db, auth, storage, admin, isFirebaseInitialized };
