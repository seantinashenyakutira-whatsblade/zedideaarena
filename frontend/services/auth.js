import api from '../lib/api';
import { supabase } from '../lib/supabase';

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const persistToken = (token, rememberMe = true) => {
  if (typeof window === 'undefined') return;
  clearToken();
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('token', token);
};

export const clearToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

const syncUserWithBackend = async (token) => {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = user?.user_metadata?.full_name ? { fullName: user.user_metadata.full_name } : {};
  return api.post('/user/login', payload);
};

export const authService = {
  login: async (credentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password.');
      }
      throw new Error(error.message);
    }

    const token = data.session.access_token;
    persistToken(token, credentials.rememberMe !== false);

    try {
      return await syncUserWithBackend(token);
    } catch (backendError) {
      await supabase.auth.signOut();
      clearToken();
      const msg = backendError?.message || 'Failed to sync with server';
      throw new Error(`Authenticated, but failed to sync: ${msg}`);
    }
  },

  signup: async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: { full_name: userData.fullName },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('Email is already registered. Please sign in.');
      }
      if (error.message.includes('weak')) {
        throw new Error('Password should be at least 6 characters.');
      }
      throw new Error(error.message);
    }

    if (data.session?.access_token) {
      persistToken(data.session.access_token, true);
      try {
        const syncResponse = await syncUserWithBackend(data.session.access_token);
        await supabase.auth.signOut();
        clearToken();
        return syncResponse;
      } catch (backendError) {
        const msg = backendError?.message || 'Failed to sync';
        throw new Error(`Account created, but failed to sync: ${msg}`);
      }
    }

    return { message: 'Check your email to confirm your account.' };
  },

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      },
    });

    if (error) throw new Error(error.message);
    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
    clearToken();
    return true;
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.post('/user/profile', data),
};
