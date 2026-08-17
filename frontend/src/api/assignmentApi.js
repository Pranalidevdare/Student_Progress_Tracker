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

export const getAssignmentStatistics = (batchId) =>
  api.get(`/api/trainer/assignments/statistics`, { params: { batchId } });

export const getAssignmentSubmissions = (assignmentId, batchId) =>
  api.get(`/api/trainer/assignments/${assignmentId}/submissions`, { params: { batchId } });

export const evaluateSubmission = (submissionId, data) =>
  api.put(`/api/trainer/assignments/submissions/${submissionId}/evaluate`, data);

export const getAllBatches = () =>
  api.get('/api/trainer/assignments/batches');

export const switchTrainerBatch = (data) =>
  api.put('/api/trainer/assignments/switch-batch', data);

export const getAssignmentDetailsById = (assignmentId) =>
  api.get(`/api/trainer/assignments/detail/${assignmentId}`);

export const getSingleAssignmentStats = (assignmentId, batchId) =>
  api.get(`/api/trainer/assignments/${assignmentId}/stats`, { params: { batchId } });

export const getStudentAssignmentSubmission = (assignmentId, studentId) =>
  api.get(`/api/student/assignments/${assignmentId}/submission`, { params: { studentId } });

export const submitStudentAssignment = (data) =>
  api.post('/api/student/assignments/submit', data);
