import axios from 'axios';
import { getToken } from '@/services/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
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
