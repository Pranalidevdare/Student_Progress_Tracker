import api from './axios';

export const getAssessmentsByBatch = (batchId) =>
  api.get(`/api/trainer/assessments/batch/${batchId}`);

export const createAssessment = (data) =>
  api.post('/api/trainer/assessments', data);

export const updateAssessment = (id, data) =>
  api.put(`/api/trainer/assessments/${id}`, data);

export const deleteAssessment = (id) =>
  api.delete(`/api/trainer/assessments/${id}`);
