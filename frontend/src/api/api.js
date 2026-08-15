import axios from 'axios';

// Centralized Axios instance pointed at Spring Boot backend on port 8080
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const authDataRaw = localStorage.getItem('spt_auth');
    if (authDataRaw) {
      try {
        const authData = JSON.parse(authDataRaw);
        if (authData?.token) {
          config.headers.Authorization = `Bearer ${authData.token}`;
        }
      } catch (e) {
        // Ignored
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('spt_auth');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────────────
export const loginApi    = (data) => api.post('/auth/login', data);
export const registerApi = (data) => api.post('/auth/register', data);

// ─── Students (Protected) ───────────────────────────────────
export const getAllStudents  = ()         => api.get('/students');
export const getStudentById  = (id)       => api.get(`/students/${id}`);
export const updateStudent   = (id, data) => api.put(`/students/${id}`, data);

// ─── Dashboard (Protected) ──────────────────────────────────
export const getDashboard = (studentId) => api.get(`/student/dashboard/${studentId}`);

// ─── Attendance ─────────────────────────────────────────────
export const getAttendanceByStudent = (studentId) => api.get(`/student/attendance/${studentId}`);

// ─── Assignments ────────────────────────────────────────────
export const getAssignmentsByBatch = (batchId) => api.get(`/student/assignments/${batchId}`);
export const submitAssignment      = (data)    => api.post('/student/assignments/submit', data);

// ─── Assessments ────────────────────────────────────────────
export const getAssessmentsByBatch = (batchId) => api.get(`/student/assessments/batch/${batchId}`);
export const submitAssessment      = (data)    => api.post('/student/assessments/submit', data);

// ─── Performance ────────────────────────────────────────────
export const getPerformance = (studentId) => api.get(`/student/performance/${studentId}`);

// ─── Study Materials ────────────────────────────────────────
export const getMaterialsByBatch = (batchId) => api.get(`/student/materials/batch/${batchId}`);

// ─── Notices ────────────────────────────────────────────────
export const getActiveNotices    = ()          => api.get('/student/notices');
export const getNoticesByBatch   = (batchId)   => api.get(`/student/notices/batch/${batchId}`);
export const getLatestNotices    = ()          => api.get('/student/notices/latest');
export const getImportantNotices = ()          => api.get('/student/notices/important');

// ─── Feedback ───────────────────────────────────────────────
export const submitFeedback       = (data)      => api.post('/student/feedback', data);
export const getFeedbackByStudent = (studentId) => api.get(`/student/feedback/${studentId}`);

// ─── Guest Sessions ─────────────────────────────────────────
export const getAllGuestSessions      = ()        => api.get('/student/guest-sessions');
export const getGuestSessionsByBatch = (batchId) => api.get(`/student/guest-sessions/batch/${batchId}`);

// ─── Interviews ─────────────────────────────────────────────
export const getInterviewByStudent = (studentId) => api.get(`/student/interviews/${studentId}`);

// ─── Toppers ────────────────────────────────────────────────
export const getAllToppers      = ()        => api.get('/student/toppers');
export const getToppersByBatch = (batchId) => api.get(`/student/toppers/batch/${batchId}`);

export default api;
