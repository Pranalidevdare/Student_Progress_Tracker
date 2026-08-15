import api from './axios';

export const getMaterialsByBatch = (batchId) =>
  api.get('/api/trainer/materials', { params: { batchId } });

export const uploadMaterial = (data) =>
  api.post('/api/trainer/materials', data);

export const updateMaterial = (id, data) =>
  api.put(`/api/trainer/materials/${id}`, data);

export const deleteMaterial = (id) =>
  api.delete(`/api/trainer/materials/${id}`);

export const getMaterialFile = (id, mode = 'view') =>
  api.get(`/api/materials/${id}/file`, { params: { mode }, responseType: 'blob' });
