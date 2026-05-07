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

export const authService = {
  login: async (credentials) => {
    try {
      const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const token = await result.user.getIdToken(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      try {
        return await api.post('/user/login');
      } catch (backendError) {
        console.error('Backend Sync Error after Login:', backendError);
        // We throw a specific error if the backend is unreachable
        throw new Error('Authenticated, but failed to sync with the Arena server.');
      }
    } catch (error) {
      console.error('Login Error:', error);
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      try {
        return await api.post('/user/login', { fullName: userData.fullName });
      } catch (backendError) {
        console.error('Backend Sync Error after Signup:', backendError);
        throw new Error('Account created, but failed to synchronize with the Arena database.');
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      try {
        await api.post('/user/login');
      } catch (backendError) {
        console.error('Backend Sync Error (Google):', backendError);
        throw new Error('Google Auth succeeded, but failed to sync with the server.');
      }
      return result.user;
    } catch (error) {
      console.error('Google Auth Error:', error);
      if (error.code === 'auth/popup-closed-by-user') throw new Error('Authentication popup was closed.');
      if (error.code === 'auth/popup-blocked') throw new Error('Popup blocked by browser. Please allow popups.');
      throw error;
    }
  },

  signInWithGithub: async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const token = await result.user.getIdToken(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      try {
        await api.post('/user/login');
      } catch (backendError) {
        console.error('Backend Sync Error (GitHub):', backendError);
        throw new Error('GitHub Auth succeeded, but failed to sync with the server.');
      }
      return result.user;
    } catch (error) {
      console.error('Github Auth Error:', error);
      if (error.code === 'auth/popup-closed-by-user') throw new Error('Authentication popup was closed.');
      if (error.code === 'auth/account-exists-with-different-credential') throw new Error('An account already exists with the same email address but different sign-in credentials.');
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
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
