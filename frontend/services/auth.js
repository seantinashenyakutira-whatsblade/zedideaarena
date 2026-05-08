import api from '../lib/api';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../lib/firebase';

const DEBUG_ENDPOINT = 'http://127.0.0.1:7293/ingest/65e1436f-7699-44c3-bae9-afb4840cd4a5';
const DEBUG_SESSION_ID = 'ce949e';
const DEBUG_RUN_ID = 'pre-fix';

const sendDebugLog = ({ hypothesisId, location, message, data = {} }) => {
  if (typeof window === 'undefined') return;
  // #region agent log
  fetch(DEBUG_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': DEBUG_SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      runId: DEBUG_RUN_ID,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
};

const persistToken = (token, rememberMe = false) => {
  if (typeof window === 'undefined') return;
  if (rememberMe) {
    localStorage.setItem('token', token);
    sessionStorage.removeItem('token');
    return;
  }
  sessionStorage.setItem('token', token);
  localStorage.removeItem('token');
};

const clearToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

const extractErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An unexpected error occurred';
};

const syncUserWithBackend = async ({ fullName, hypothesisId }) => {
  const payload = fullName ? { fullName } : undefined;
  try {
    return await api.post('/user/login', payload);
  } catch (firstError) {
    sendDebugLog({
      hypothesisId,
      location: 'frontend/services/auth.js:syncUserWithBackend:first_attempt_error',
      message: 'User sync first attempt failed',
      data: { message: extractErrorMessage(firstError), status: firstError?.status || null },
    });
    // Try one immediate retry with a fresh token for transient backend/startup failures.
    const freshToken = await auth.currentUser?.getIdToken(true);
    if (freshToken) {
      persistToken(freshToken, true);
    }
    return api.post('/user/login', payload);
  }
};

export const authService = {
  login: async (credentials) => {
    try {
      // #region agent log
      sendDebugLog({
        hypothesisId: 'H2',
        location: 'frontend/services/auth.js:login:start',
        message: 'Email login started',
        data: { hasEmail: Boolean(credentials?.email) },
      });
      // #endregion
      const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const token = await result.user.getIdToken(true);
      persistToken(token, Boolean(credentials?.rememberMe));
      // #region agent log
      sendDebugLog({
        hypothesisId: 'H2',
        location: 'frontend/services/auth.js:login:firebase_success',
        message: 'Email login firebase success',
        data: { providerId: result?.user?.providerData?.[0]?.providerId || 'password' },
      });
      // #endregion
      try {
        return await syncUserWithBackend({ hypothesisId: 'H2' });
      } catch (backendError) {
        console.error('Backend Sync Error after Login:', backendError);
        // Prevent "half-authenticated" state if backend sync fails.
        try { await signOut(auth); } catch (_) {}
        clearToken();
        // #region agent log
        sendDebugLog({
          hypothesisId: 'H2',
          location: 'frontend/services/auth.js:login:backend_sync_error',
          message: 'Backend sync failed after email login',
          data: { backendError: typeof backendError === 'string' ? backendError : backendError?.message || 'unknown' },
        });
        // #endregion
        // Include backend error details to help debugging in dev
        const backendMsg = typeof backendError === 'string' ? backendError : (backendError?.message || JSON.stringify(backendError));
        throw new Error(`Authenticated, but failed to sync with the Arena server: ${backendMsg}`);
      }
    } catch (error) {
      console.error('Login Error:', error);
      // #region agent log
      sendDebugLog({
        hypothesisId: 'H2',
        location: 'frontend/services/auth.js:login:catch',
        message: 'Email login failed',
        data: { code: error?.code || null, message: error?.message || 'unknown' },
      });
      // #endregion
      if (error.code === 'auth/user-not-found') throw new Error('No account found with this email.');
      if (error.code === 'auth/wrong-password') throw new Error('Incorrect password.');
      if (error.code === 'auth/invalid-credential') throw new Error('Invalid email or password.');
      if (error.code === 'auth/too-many-requests') throw new Error('Too many failed attempts. Try again later.');
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const token = await result.user.getIdToken(true);
      persistToken(token, true);
      try {
        const syncResponse = await syncUserWithBackend({ fullName: userData.fullName, hypothesisId: 'H2' });
        // Enforce post-signup login step for stronger auth policy.
        await signOut(auth);
        clearToken();
        // #region agent log
        sendDebugLog({
          hypothesisId: 'H12',
          location: 'frontend/services/auth.js:signup:post_create_signout',
          message: 'Signup completed and user signed out intentionally',
          data: { hasEmail: Boolean(userData?.email) },
        });
        // #endregion
        return syncResponse;
      } catch (backendError) {
        console.error('Backend Sync Error after Signup:', backendError);
        const backendMsg = typeof backendError === 'string' ? backendError : (backendError?.message || JSON.stringify(backendError));
        throw new Error(`Account created, but failed to synchronize with the Arena database: ${backendMsg}`);
      }
    } catch (error) {
      console.error('Signup Error:', error);
      if (error.code === 'auth/email-already-in-use') throw new Error('Email is already registered. Please sign in.');
      if (error.code === 'auth/invalid-email') throw new Error('Invalid email format.');
      if (error.code === 'auth/weak-password') throw new Error('Password should be at least 6 characters.');
      throw error;
    }
  },
  
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken(true);
      persistToken(token, true);
      try {
        await syncUserWithBackend({ hypothesisId: 'H3' });
      } catch (backendError) {
        console.error('Backend Sync Error (Google):', backendError);
        // Prevent "half-authenticated" state if backend sync fails.
        try { await signOut(auth); } catch (_) {}
        clearToken();
        const backendMsg = typeof backendError === 'string' ? backendError : (backendError?.message || JSON.stringify(backendError));
        throw new Error(`Google Auth succeeded, but failed to sync with the server: ${backendMsg}`);
      }
      return result.user;
    } catch (error) {
      console.error('Google Auth Error:', error);
      // #region agent log
      sendDebugLog({
        hypothesisId: 'H1',
        location: 'frontend/services/auth.js:signInWithGoogle:catch',
        message: 'Google popup auth failed',
        data: {
          code: error?.code || null,
          message: error?.message || 'unknown',
          hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
          authDomain: auth?.config?.authDomain || null,
        },
      });
      // #endregion
      if (error.code === 'auth/popup-closed-by-user') throw new Error('Authentication popup was closed.');
      if (error.code === 'auth/popup-blocked') throw new Error('Popup blocked by browser. Please allow popups.');
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('Google sign-in is blocked: this domain is not authorized in Firebase. Add zedideaarena.netlify.app under Firebase Authentication > Settings > Authorized domains.');
      }
      throw error;
    }
  },

  signInWithGithub: async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const token = await result.user.getIdToken(true);
      persistToken(token, true);
      try {
        await syncUserWithBackend({ hypothesisId: 'H4' });
      } catch (backendError) {
        console.error('Backend Sync Error (GitHub):', backendError);
        // Prevent "half-authenticated" state if backend sync fails.
        try { await signOut(auth); } catch (_) {}
        clearToken();
        const backendMsg = typeof backendError === 'string' ? backendError : (backendError?.message || JSON.stringify(backendError));
        throw new Error(`GitHub Auth succeeded, but failed to sync with the server: ${backendMsg}`);
      }
      return result.user;
    } catch (error) {
      console.error('Github Auth Error:', error);
      // #region agent log
      sendDebugLog({
        hypothesisId: 'H4',
        location: 'frontend/services/auth.js:signInWithGithub:catch',
        message: 'GitHub popup auth failed',
        data: {
          code: error?.code || null,
          message: error?.message || 'unknown',
          hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
          authDomain: auth?.config?.authDomain || null,
        },
      });
      // #endregion
      if (error.code === 'auth/popup-closed-by-user') throw new Error('Authentication popup was closed.');
      if (error.code === 'auth/account-exists-with-different-credential') throw new Error('An account already exists with the same email address but different sign-in credentials.');
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('GitHub sign-in is blocked: this domain is not authorized in Firebase. Add zedideaarena.netlify.app under Firebase Authentication > Settings > Authorized domains.');
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      clearToken();
      return true;
    } catch (error) {
      console.error('Logout Error:', error);
      throw error;
    }
  },

  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.post('/user/profile', data),
  submitKYC: () => api.post('/kyc/submit'),
};
