import axios from 'axios';

// Use provided backend URL as default; you can still override via NEXT_PUBLIC_API_URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zedideaarena-1.onrender.com/api';
const FALLBACK_API_URL = 'https://zedideaarena-1.onrender.com/api';
const DEBUG_ENDPOINT = 'http://127.0.0.1:7293/ingest/65e1436f-7699-44c3-bae9-afb4840cd4a5';
const DEBUG_SESSION_ID = 'ce949e';
const DEBUG_RUN_ID = 'pre-fix';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Interceptor for Auth (if needed later for token)
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token') || sessionStorage.getItem('token')
    : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // #region agent log
  sendDebugLog({
    hypothesisId: 'H3',
    location: 'frontend/lib/api.js:request_interceptor',
    message: 'API request prepared',
    data: {
      hasToken: Boolean(token),
      method: config?.method || 'get',
      url: config?.url || null,
      baseURL: config?.baseURL || null,
    },
  });
  // #endregion
  return config;
});
// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalConfig = error?.config || {};
    const hasNoHttpResponse = !error?.response;
    const isLocalApiBase = typeof originalConfig?.baseURL === 'string' && originalConfig.baseURL.includes('localhost:5000');
    const shouldRetryWithFallback = hasNoHttpResponse && isLocalApiBase && !originalConfig.__retriedWithFallback;

    if (shouldRetryWithFallback) {
      // #region agent log
      sendDebugLog({
        hypothesisId: 'H3',
        location: 'frontend/lib/api.js:response_error:fallback_retry',
        message: 'Retrying request with fallback backend URL',
        data: {
          originalBaseURL: originalConfig.baseURL,
          fallbackBaseURL: FALLBACK_API_URL,
          url: originalConfig.url || null,
          method: originalConfig.method || null,
        },
      });
      // #endregion

      return api.request({
        ...originalConfig,
        baseURL: FALLBACK_API_URL,
        __retriedWithFallback: true,
      });
    }

    const status = error?.response?.status ?? null;
    const responseData = error?.response?.data;
    const message =
      (typeof responseData === 'string' && responseData.trim()) ||
      responseData?.message ||
      error?.message ||
      'An unexpected error occurred';

    console.error('API Error:', { status, message, url: error?.config?.url, baseURL: error?.config?.baseURL });
    // #region agent log
    sendDebugLog({
      hypothesisId: 'H3',
      location: 'frontend/lib/api.js:response_error',
      message: 'API response error',
      data: {
        status,
        url: error?.config?.url || null,
        method: error?.config?.method || null,
        baseURL: error?.config?.baseURL || null,
        message,
      },
    });
    // #endregion
    return Promise.reject({
      message: hasNoHttpResponse && isLocalApiBase
        ? 'Cannot reach local backend at localhost:5000. Start backend server or use deployed API.'
        : message,
      status,
      url: error?.config?.url || null,
      method: error?.config?.method || null,
      data: responseData ?? null,
      raw: error,
    });
  }
);

export default api;
