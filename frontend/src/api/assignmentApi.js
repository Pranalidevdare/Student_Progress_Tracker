import api from './axios';

export const getAssignmentsByBatch = (batchId) =>
  api.get(`/api/trainer/assignments/${batchId}`);

export const createAssignment = (data) =>
  api.post('/api/trainer/assignments', data);

export const updateAssignment = (id, data) =>
  api.put(`/api/trainer/assignments/${id}`, data);

export const deleteAssignment = (id) =>
  api.delete(`/api/trainer/assignments/${id}`);
