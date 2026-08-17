import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
if (rawBaseUrl && !rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = rawBaseUrl.endsWith('/') ? `${rawBaseUrl}api` : `${rawBaseUrl}/api`;
}

const api = axios.create({
  baseURL: rawBaseUrl,
  timeout: 15000,
});

// Attach JWT on every request, normalize double /api prefixes, and handle JSON vs Multipart Content-Type
api.interceptors.request.use((config) => {
  // Normalize URL to prevent /api/api/... duplicate prefixes when baseURL already includes /api
  if (config.url) {
    if (config.url.startsWith('/api/')) {
      config.url = config.url.substring(4);
    } else if (config.url === '/api') {
      config.url = '/';
    } else if (config.url.startsWith('api/')) {
      config.url = config.url.substring(3);
    }
  }

  // Handle Content-Type dynamically:
  // For FormData / multipart uploads, remove Content-Type header so browser/axios sets multipart/form-data with proper boundary.
  // For standard JSON requests, set application/json.
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  } else {
    config.headers = config.headers || {};
    if (!config.headers['Content-Type'] && !config.headers['content-type']) {
      config.headers['Content-Type'] = 'application/json';
    }
  }

  let token = localStorage.getItem('token');
  if (!token) {
    const authDataRaw = localStorage.getItem('spt_auth');
    if (authDataRaw) {
      try {
        const authData = JSON.parse(authDataRaw);
        token = authData?.token;
      } catch (e) {}
    }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally with safe path checking (don't redirect on login attempt failure or public pages)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isAuthEndpoint = err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/register');
      const isPublicPage = window.location.pathname === '/login' ||
                           window.location.pathname === '/' ||
                           window.location.pathname === '/register' ||
                           window.location.pathname === '/aptitude-test' ||
                           window.location.pathname === '/documentation' ||
                           window.location.pathname === '/selection-status';
      if (!isAuthEndpoint && !isPublicPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('spt_auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
