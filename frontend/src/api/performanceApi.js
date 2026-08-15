import api from './axios';

export const getPerformance = (studentId) => api.get(`/api/trainer/performance/${studentId}`);
export const updatePerformance = (studentId) => api.put(`/api/trainer/performance/${studentId}`);

export const getStudentPerformance = (studentId) => api.get(`/api/student/performance/${studentId}`);
