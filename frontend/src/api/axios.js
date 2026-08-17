import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
if (rawBaseUrl && !rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = rawBaseUrl.endsWith('/') ? `${rawBaseUrl}api` : `${rawBaseUrl}/api`;
}

const api = axios.create({
  baseURL: rawBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
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

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
