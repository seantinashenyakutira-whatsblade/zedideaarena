import api from '../lib/api';
import { supabase } from '../lib/supabase';

const PRODUCTION_DOMAIN = 'zedideaarena.com';
const HUB_HOST = `hub.${PRODUCTION_DOMAIN}`;
const MAIN_HOST = PRODUCTION_DOMAIN;
const PRODUCTION_ORIGIN = `https://${PRODUCTION_DOMAIN}`;

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match?.[2] || null;
}

function setCookie(name, value, maxAge) {
  if (typeof document === 'undefined') return;
  const isProd = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
  const domain = isProd ? `.${PRODUCTION_DOMAIN}` : undefined;
  const parts = [
    `${name}=${value}`,
    'path=/',
    isProd ? `domain=${domain}` : '',
    maxAge ? `max-age=${maxAge}` : '',
    'SameSite=Lax',
    isProd ? 'Secure' : '',
  ].filter(Boolean);
  document.cookie = parts.join('; ');
}

function removeCookie(name) {
  if (typeof document === 'undefined') return;
  const isProd = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
  const domain = isProd ? `.${PRODUCTION_DOMAIN}` : undefined;
  const parts = [
    `${name}=`,
    'path=/',
    isProd ? `domain=${domain}` : '',
    'max-age=0',
  ].filter(Boolean);
  document.cookie = parts.join('; ');
}

const TOKEN_COOKIE = 'za_token';

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || sessionStorage.getItem('token') || getCookie(TOKEN_COOKIE);
};

export const persistToken = (token, rememberMe = true) => {
  if (typeof window === 'undefined') return;
  clearToken();
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('token', token);
  setCookie(TOKEN_COOKIE, token, rememberMe ? 2592000 : 86400);
};

export const clearToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  removeCookie(TOKEN_COOKIE);
};

function isDevHost() {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h.includes('127.0.0.1');
}

function getHubUrl(path = '/') {
  if (typeof window === 'undefined') return path;
  if (isDevHost()) return path;
  return `https://${HUB_HOST}${path}`;
}

function getMainUrl(path = '/') {
  if (typeof window === 'undefined') return path;
  if (isDevHost()) return path;
  return `https://${MAIN_HOST}${path}`;
}

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

    syncUserWithBackend(token).catch(() => {});
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
      syncUserWithBackend(data.session.access_token).catch(() => {});
      return { message: 'Account created successfully.' };
    }

    return { message: 'Check your email to confirm your account.' };
  },

  signInWithGoogle: async () => {
    const redirectTo = typeof window !== 'undefined'
      ? `${PRODUCTION_ORIGIN}/auth/callback`
      : undefined;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
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

  forgotPassword: async (email) => {
    const res = await api.post('/user/forgot-password', { email });
    if (res.status !== 'success') {
      throw new Error(res.error || 'Failed to send reset email.');
    }
    return res;
  },

  resetPassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      if (error.message.includes('weak')) {
        throw new Error('Password should be at least 6 characters.');
      }
      throw new Error(error.message);
    }
    return { message: 'Password updated successfully.' };
  },

  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.post('/user/profile', data),
};

export { getHubUrl, getMainUrl };
