import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com` : undefined),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

if (typeof window !== 'undefined') {
  // #region agent log
  fetch('http://127.0.0.1:7293/ingest/65e1436f-7699-44c3-bae9-afb4840cd4a5', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'ce949e',
    },
    body: JSON.stringify({
      sessionId: 'ce949e',
      runId: 'pre-fix',
      hypothesisId: 'H1',
      location: 'frontend/lib/firebase.js:init',
      message: 'Firebase client initialized',
      data: {
        hasApiKey: Boolean(firebaseConfig.apiKey),
        authDomain: firebaseConfig.authDomain || null,
        projectId: firebaseConfig.projectId || null,
        hostname: window.location.hostname,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

// Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { app, auth, googleProvider, githubProvider };
