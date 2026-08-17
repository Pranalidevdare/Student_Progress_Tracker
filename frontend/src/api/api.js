import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
if (rawBaseUrl && !rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = rawBaseUrl.endsWith('/') ? `${rawBaseUrl}api` : `${rawBaseUrl}/api`;
}

const api = axios.create({
  baseURL: rawBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
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
  },
  (error) => Promise.reject(error)
);

export const getAllStudents          = ()         => api.get('/students');
export const getCurrentStudent        = ()         => api.get('/students/me');
export const getMyStudentProfile      = ()         => api.get('/students/me');
export const updateCurrentStudent     = (data)     => api.put('/students/me', data);
export const updateMyStudentProfile  = (data)     => api.put('/students/me', data);
export const getStudentById          = (id)       => api.get(`/students/${id}`);
export const updateStudent           = (id, data) => api.put(`/students/${id}`, data);

export default api;