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
      const token = await result.user.getIdToken(true); // Force refresh to get latest claims
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      return await api.post('/user/login');
    } catch (error) {
      console.error('Login Error:', error);
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
      // Sync with backend
      return await api.post('/user/login');
    } catch (error) {
      console.error('Signup Error:', error);
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
      await api.post('/user/login');
      return result.user;
    } catch (error) {
      console.error('Google Auth Error:', error);
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
      await api.post('/user/login');
      return result.user;
    } catch (error) {
      console.error('Github Auth Error:', error);
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
