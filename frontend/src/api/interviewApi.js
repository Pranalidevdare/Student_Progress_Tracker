import api from './axios';

export const conductInterview = (data) => api.post('/api/trainer/interviews', data);
export const updateInterview = (id, data) => api.put(`/api/trainer/interviews/${id}`, data);
export const getInterviewByStudent = (studentId) => api.get(`/api/trainer/interviews/student/${studentId}`);
