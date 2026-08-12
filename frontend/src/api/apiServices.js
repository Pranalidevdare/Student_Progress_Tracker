import api from './axios';

// ─── AUTHENTICATION APIs (Strict Real Backend Verification) ─────────────
export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  }
};

// ─── APPLICATION / REGISTRATION APIs ──────────────────────────────────
export const applicationApi = {
  submit: (form) => api.post('/api/applications/submit', form),
  getAll: () => api.get('/api/admin/applications/getAll'),
  getById: (id) => api.get(`/api/admin/applications/getById/${id}`),
  getByAppNumber: (appNum) => api.get(`/api/admin/applications/getByApplicationNumber/${appNum}`),
  searchByName: (name) => api.get(`/api/admin/applications/searchByName?name=${name}`),
  getByStatus: (status) => api.get(`/api/admin/applications/getByStatus/${status}`),
  getEligibleForAptitude: () => api.get('/api/admin/applications/eligible-for-aptitude'),
  updateStatus: (id, status) => api.put(`/api/admin/applications/update/${id}?status=${status}`),
  delete: (id) => api.delete(`/api/admin/applications/delete/${id}`),
  createStudent: (id) => api.post(`/api/admin/applications/${id}/create-student`),
  getEnrollmentLetter: (id) => api.get(`/api/admin/applications/${id}/enrollment-letter`)
};

// ─── ONLINE APTITUDE TEST APIs ─────────────────────────────────────────
export const aptitudeApi = {
  getQuestions: () => api.get('/api/aptitude/questions'),
  startTest: (candidateId) => api.post(`/api/aptitude/start/${candidateId}`),
  submitTest: (submission) => api.post('/api/aptitude/submit', submission),
  getResult: (candidateId) => api.get(`/api/aptitude/result/${candidateId}`),
  scheduleExam: (scheduleData) => api.post('/api/admin/aptitude/schedule', scheduleData),
  getSchedules: () => api.get('/api/admin/aptitude/schedules'),
  cancelSchedule: (id) => api.put(`/api/admin/aptitude/schedule/${id}/cancel`)
};

// ─── DOCUMENTATION APIs ────────────────────────────────────────────────
export const documentationApi = {
  uploadDocument: (candidateId, docType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    return api.post(`/api/documentation/upload/${candidateId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getDocuments: (candidateId) => api.get(`/api/documentation/candidate/${candidateId}`),
  verifyDocument: (docId, status, notes) => api.put(`/api/documentation/verify/${docId}?status=${status}&notes=${notes}`)
};

// ─── SELECTION STAGE APIs ──────────────────────────────────────────────
export const selectionApi = {
  getSelectionStatus: (candidateId) => api.get(`/api/selection/status/${candidateId}`),
  updateStage: (candidateId, stage, comments) => api.put(`/api/selection/update/${candidateId}?stage=${stage}&comments=${comments}`)
};

// ─── ADMIN MANAGEMENT APIs ─────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getAllStudents: () => api.get('/api/admin/students'),
  getStudentById: (id) => api.get(`/api/admin/students/${id}`),
  updateStudent: (id, data) => api.put(`/api/admin/students/update/${id}`, data),
  deleteStudent: (id) => api.delete(`/api/admin/students/delete/${id}`),

  addTrainer: (trainerData) => api.post('/api/admin/trainers/add', trainerData),
  getAllTrainers: () => api.get('/api/admin/trainers/getAll'),
  getTrainerById: (id) => api.get(`/api/admin/trainers/getById/${id}`),
  updateTrainer: (id, data) => api.put(`/api/admin/trainers/update/${id}`, data),
  deleteTrainer: (id) => api.delete(`/api/admin/trainers/delete/${id}`),

  createBatch: (batchData) => api.post('/api/admin/batches/create', batchData),
  getAllBatches: () => api.get('/api/admin/batches/getAll'),
  getBatchById: (id) => api.get(`/api/admin/batches/getById/${id}`),
  updateBatch: (id, data) => api.put(`/api/admin/batches/update/${id}`, data)
};

// ─── TRAINER OPERATIONAL APIs ──────────────────────────────────────────
export const trainerApi = {
  getDashboard: (trainerId) => api.get(`/api/trainer/dashboard/${trainerId}`),
  
  markAttendance: (data) => api.post('/api/trainer/attendance', data),
  updateAttendance: (id, data) => api.put(`/api/trainer/attendance/${id}`, data),
  getAttendanceByBatch: (batchId) => api.get(`/api/trainer/attendance/batch/${batchId}`),

  createAssignment: (data) => api.post('/api/trainer/assignments', data),
  updateAssignment: (id, data) => api.put(`/api/trainer/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/api/trainer/assignments/${id}`),
  getAssignmentsByBatch: (batchId) => api.get(`/api/trainer/assignments/${batchId}`),

  createAssessment: (data) => api.post('/api/trainer/assessments', data),
  updateAssessment: (id, data) => api.put(`/api/trainer/assessments/${id}`, data),
  deleteAssessment: (id) => api.delete(`/api/trainer/assessments/${id}`),
  getAssessmentsByBatch: (batchId) => api.get(`/api/trainer/assessments/batch/${batchId}`),

  uploadMaterial: (data) => api.post('/api/trainer/materials', data),
  updateMaterial: (id, data) => api.put(`/api/trainer/materials/${id}`, data),
  deleteMaterial: (id) => api.delete(`/api/trainer/materials/${id}`),
  getMaterialsByBatch: (batchId) => api.get(`/api/trainer/materials/batch/${batchId}`),

  createNotice: (data) => api.post('/api/trainer/notices', data),
  updateNotice: (id, data) => api.put(`/api/trainer/notices/${id}`, data),
  deleteNotice: (id) => api.delete(`/api/trainer/notices/${id}`),
  getAllNotices: () => api.get('/api/trainer/notices'),
  getNoticesByTrainer: (trainerId) => api.get(`/api/trainer/notices/trainer/${trainerId}`),

  createGuestSession: (data) => api.post('/api/trainer/guest-sessions', data),
  updateGuestSession: (id, data) => api.put(`/api/trainer/guest-sessions/${id}`, data),
  deleteGuestSession: (id) => api.delete(`/api/trainer/guest-sessions/${id}`),
  getSessionsByTrainer: (trainerId) => api.get(`/api/trainer/guest-sessions/trainer/${trainerId}`),
  getSessionsByBatch: (batchId) => api.get(`/api/trainer/guest-sessions/batch/${batchId}`),

  scheduleInterview: (data) => api.post('/api/trainer/interviews', data),
  updateInterview: (id, data) => api.put(`/api/trainer/interviews/${id}`, data),
  getInterviewByStudent: (studentId) => api.get(`/api/trainer/interviews/student/${studentId}`),

  updatePerformance: (studentId, data) => api.put(`/api/trainer/performance/${studentId}`, data),
  getPerformance: (studentId) => api.get(`/api/trainer/performance/${studentId}`),

  getFeedbackForTrainer: (trainerId) => api.get(`/api/trainer/feedback/${trainerId}`),

  getAllToppers: () => api.get('/api/trainer/toppers'),
  getToppersByBatch: (batchId) => api.get(`/api/trainer/toppers/batch/${batchId}`),
  getTopPerformers: (limit) => api.get(`/api/trainer/toppers/top/${limit}`)
};

// ─── STUDENT OPERATIONAL APIs ──────────────────────────────────────────
export const studentApi = {
  getDashboard: (studentId) => api.get(`/api/student/dashboard/${studentId}`),
  getAttendance: (studentId) => api.get(`/api/student/attendance/${studentId}`),
  getAssignments: (batchId) => api.get(`/api/student/assignments/${batchId}`),
  submitAssignment: (data) => api.post('/api/student/assignments/submit', data),
  getAssessments: (batchId) => api.get(`/api/student/assessments/batch/${batchId}`),
  getPerformance: (studentId) => api.get(`/api/student/performance/${studentId}`),
  getMaterials: (batchId) => api.get(`/api/student/materials/batch/${batchId}`),
  getNotices: (batchId) => api.get(`/api/student/notices/batch/${batchId}`),
  submitFeedback: (data) => api.post('/api/student/feedback', data),
  getGuestSessions: (batchId) => api.get(`/api/student/guest-sessions/batch/${batchId}`),
  getInterview: (studentId) => api.get(`/api/student/interviews/${studentId}`),
  getToppers: () => api.get('/api/student/toppers')
};

export default api;
