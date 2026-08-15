import api from './axios';

// ─── STUDENT API ENDPOINTS ──────────────────────────────────────
export const getStudentAssessmentsByBatch = (batchId) =>
  api.get(`/api/student/assessments/batch/${batchId}`);

export const submitAssessment = (data) =>
  api.post('/api/student/assessments/submit', data);

// ─── TRAINER API ENDPOINTS ──────────────────────────────────────
export const getAssessmentsByBatch = (batchId) =>
  api.get(`/api/trainer/assessments/batch/${batchId}`);

export const createAssessment = (data) =>
  api.post('/api/trainer/assessments', data);

export const updateAssessment = (id, data) =>
  api.put(`/api/trainer/assessments/${id}`, data);

export const deleteAssessment = (id) =>
  api.delete(`/api/trainer/assessments/${id}`);
