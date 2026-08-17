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

export const uploadAssessmentDocument = (formData) =>
  api.post('/trainer/assessments/upload-document', formData);

export const updateAssessment = (id, data) =>
  api.put(`/api/trainer/assessments/${id}`, data);

export const deleteAssessment = (id) =>
  api.delete(`/api/trainer/assessments/${id}`);

export const getAssessmentStatistics = (batchId) =>
  api.get('/api/trainer/assignments/statistics', { params: { batchId } });

export const getAssessmentSubmissions = (assessmentId, batchId) =>
  api.get(`/api/trainer/assignments/${assessmentId}/submissions`, { params: { batchId } });

export const evaluateAssessmentSubmission = (submissionId, data) =>
  api.put(`/api/trainer/assessments/submissions/${submissionId}/evaluate`, data);

export const getAllBatches = () =>
  api.get('/api/trainer/assignments/batches');

export const switchTrainerBatch = (data) =>
  api.put('/api/trainer/assignments/switch-batch', data);

export const getAssessmentDetailsById = (assessmentId) =>
  api.get(`/api/trainer/assessments/${assessmentId}`);

export const getSingleAssessmentStats = (assessmentId, batchId) =>
  api.get(`/api/trainer/assessments/${assessmentId}/statistics`, { params: { batchId } });

export const getAssessmentStudentDetails = (assessmentId, batchId) =>
  api.get(`/api/trainer/assessments/${assessmentId}/students`, { params: { batchId } });

export const getStudentAssessmentAnswers = (assessmentId, studentId) =>
  api.get(`/api/trainer/assessments/${assessmentId}/students/${studentId}/answers`);

export const getAssessmentEvaluationDetails = (submissionId) =>
  api.get(`/api/trainer/assessments/submissions/${submissionId}/evaluation`);
