import api from './axios';

export const getTrainerById = (id) => api.get(`/api/trainers/${id}`);
export const updateTrainer = (id, data) => api.put(`/api/trainers/${id}`, data);
export const getAllTrainers = () => api.get('/api/trainers');
export const getTrainerDashboard = (trainerId) => api.get(`/api/trainer/dashboard/${trainerId}`);
