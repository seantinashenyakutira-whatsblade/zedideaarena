import axios from 'axios';
import { getToken } from '@/services/auth';

const PRODUCTION_API = 'https://zedideaarena.onrender.com/api';

function resolveApiUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim();
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host.includes('127.0.0.1')) {
      return 'http://localhost:5000/api';
    }
  }
  return PRODUCTION_API;
}

const api = axios.create({
  baseURL: resolveApiUrl(),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? getToken() : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status ?? null;
    const responseData = error?.response?.data;
    const message =
      (typeof responseData === 'string' && responseData.trim()) ||
      responseData?.error ||
      responseData?.message ||
      error?.message ||
      'An unexpected error occurred';

    return Promise.reject({
      message,
      status,
      url: error?.config?.url || null,
      data: responseData ?? null,
      raw: error,
    });
  }
);

export default api;
