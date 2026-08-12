import api from './axios';

export const getGuestSessionsByTrainer = (trainerId) =>
  api.get(`/api/trainer/guest-sessions/trainer/${trainerId}`);

export const getGuestSessionsByBatch = (batchId) =>
  api.get(`/api/trainer/guest-sessions/batch/${batchId}`);

export const getGuestSessionById = (id) =>
  api.get(`/api/trainer/guest-sessions/${id}`);

export const createGuestSession = (data) =>
  api.post('/api/trainer/guest-sessions', data);

export const updateGuestSession = (id, data) =>
  api.put(`/api/trainer/guest-sessions/${id}`, data);

export const deleteGuestSession = (id) =>
  api.delete(`/api/trainer/guest-sessions/${id}`);
