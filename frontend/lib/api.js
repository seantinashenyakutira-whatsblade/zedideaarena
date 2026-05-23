import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token')
    : null;
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
