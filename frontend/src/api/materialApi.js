import api from './axios';

export const getMaterialsByBatch = (batchId) =>
  api.get(`/api/trainer/materials/batch/${batchId}`);

export const uploadMaterial = (data) =>
  api.post('/api/trainer/materials', data);

export const updateMaterial = (id, data) =>
  api.put(`/api/trainer/materials/${id}`, data);

export const deleteMaterial = (id) =>
  api.delete(`/api/trainer/materials/${id}`);
