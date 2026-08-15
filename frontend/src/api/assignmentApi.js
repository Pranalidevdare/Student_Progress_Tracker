import api from './axios';

// ─── STUDENT API ENDPOINTS ──────────────────────────────────────
export const getStudentAssignmentsByBatch = (batchId) =>
  api.get(`/api/student/assignments/${batchId}`);

export const submitAssignment = (data) =>
  api.post('/api/student/assignments/submit', data);

// ─── TRAINER API ENDPOINTS ──────────────────────────────────────
export const getAssignmentsByBatch = (batchId) =>
  api.get(`/api/trainer/assignments/${batchId}`);

export const createAssignment = (data) =>
  api.post('/api/trainer/assignments', data);

export const updateAssignment = (id, data) =>
  api.put(`/api/trainer/assignments/${id}`, data);

export const deleteAssignment = (id) =>
  api.delete(`/api/trainer/assignments/${id}`);
