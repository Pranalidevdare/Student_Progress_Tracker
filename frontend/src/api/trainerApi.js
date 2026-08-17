import api from './axios';

export const getTrainerProfile = () => api.get('/api/trainers/profile');
export const updateTrainerProfile = (data) => api.put('/api/trainers/profile', data);
export const getTrainerById = (id) => api.get(`/api/trainers/${id}`);
export const updateTrainer = (id, data) => api.put(`/api/trainers/${id}`, data);
export const getAllTrainers = () => api.get('/api/admin/trainers/getAll');
export const adminGetTrainerById = (id) => api.get(`/api/admin/trainers/getById/${id}`);
export const adminUpdateTrainer = (id, data) => api.put(`/api/admin/trainers/update/${id}`, data);
export const getTrainerDashboard = (trainerId) =>
  api.get('/api/trainer/dashboard', { params: trainerId ? { trainerId } : {} });
