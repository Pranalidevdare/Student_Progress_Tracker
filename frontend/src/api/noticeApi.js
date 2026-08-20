import api from './axios';

export const getAllNotices = () => api.get('/api/trainer/notices');
export const getActiveNotices = () => api.get('/api/student/notices');
export const getStudentNotices = () => api.get('/api/student/notices');
export const getTrainerNotices = (trainerId) => api.get(`/api/trainer/notices/trainer/${trainerId}`);
export const getNoticeById = (id) => api.get(`/api/trainer/notices/${id}`);
export const createNotice = (data) => api.post('/api/trainer/notices', data);
export const updateNotice = (id, data) => api.put(`/api/trainer/notices/${id}`, data);
export const deleteNotice = (id) => api.delete(`/api/trainer/notices/${id}`);
