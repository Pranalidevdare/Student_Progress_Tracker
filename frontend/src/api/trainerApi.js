import api from './axios';

export const getTrainerById = (id) => api.get(`/api/admin/trainers/getById/${id}`);
export const updateTrainer = (id, data) => api.put(`/api/admin/trainers/update/${id}`, data);
export const getAllTrainers = () => api.get('/api/admin/trainers/getAll');
export const getTrainerDashboard = (trainerId) => api.get(`/api/trainer/dashboard/${trainerId}`);
