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
  getByAppNumber: (appNum) => api.get(`/api/applications/getByApplicationNumber/${appNum}`),
  searchByName: (name) => api.get(`/api/admin/applications/searchByName?name=${name}`),
  getByStatus: (status) => api.get(`/api/admin/applications/getByStatus/${status}`),
  getEligibleForAptitude: () => api.get('/api/admin/applications/eligible-for-aptitude'),
  updateStatus: (id, status, remarks = '') => api.patch(`/api/admin/applications/updateStatus/${id}`, { status, remarks }),
  delete: (id) => api.delete(`/api/admin/applications/delete/${id}`),
  createStudent: (id) => api.post(`/api/admin/applications/${id}/create-student`),
  getEnrollmentLetter: (id) => api.get(`/api/admin/applications/${id}/enrollment-letter`),
  assignBatch: (applicationId, batchId) => api.post('/api/admin/applications/assign-batch', { applicationId, batchId }),
  changeBatch: (applicationId, batchId) => api.patch('/api/admin/applications/change-batch', { applicationId, batchId })
};

// ─── BATCH MANAGEMENT APIs ────────────────────────────────────────────
export const batchApi = {
  getAll: () => api.get('/api/batches'),
  getActive: () => api.get('/api/batches/active'),
  getById: (id) => api.get(`/api/batches/${id}`),
  getByName: (name) => api.get(`/api/batches/by-name/${name}`),
  getByStatus: (status) => api.get(`/api/batches/status/${status}`),
  getByCourse: (courseName) => api.get(`/api/batches/course?courseName=${courseName}`),
  hasCapacity: (batchId) => api.get(`/api/batches/${batchId}/has-capacity`),
  getAvailableCapacity: (batchId) => api.get(`/api/batches/${batchId}/available-capacity`)
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
// ─── DOCUMENTATION APIs ────────────────────────────────────────────────
export const documentationApi = {

  submitDocumentation: async (
    applicationId,
    payload,
    files = {}
  ) => {

    const formData = new FormData();

    // =========================================================
    // APPLICATION
    // =========================================================

    formData.append(
      'applicationId',
      String(applicationId)
    );

    // =========================================================
    // PERSONAL DETAILS
    // =========================================================

    const fields = {
      candidateName: payload.candidateName,
      dateOfBirth: payload.dateOfBirth,
      age: payload.age,
      gender: payload.gender,
      otherGender: payload.otherGender,

      fatherName: payload.fatherName,
      fatherOccupation: payload.fatherOccupation,

      motherName: payload.motherName,
      motherOccupation: payload.motherOccupation,

      firstGraduate: payload.firstGraduate,
      maritalStatus: payload.maritalStatus,

      // =====================================================
      // MAILING ADDRESS
      // =====================================================

      mailingFullName: payload.mailingFullName,
      mailingAddress: payload.mailingAddress,
      mailingPincode: payload.mailingPincode,
      personalMobile: payload.personalMobile,
      personalEmail: payload.personalEmail,

      // =====================================================
      // GUARDIAN
      // =====================================================

      guardianFullName: payload.guardianFullName,
      guardianAddress: payload.guardianAddress,
      guardianPincode: payload.guardianPincode,
      guardianMobile: payload.guardianMobile,
      guardianLandline: payload.guardianLandline,

      // =====================================================
      // 10TH
      // =====================================================

      tenthSchoolName: payload.tenthSchoolName,
      tenthBoard: payload.tenthBoard,
      tenthPassingYear: payload.tenthPassingYear,
      tenthMarks: payload.tenthMarks,
      tenthPercentage: payload.tenthPercentage,

      // =====================================================
      // 12TH
      // =====================================================

      twelfthSchoolName: payload.twelfthSchoolName,
      twelfthBoard: payload.twelfthBoard,
      twelfthPassingYear: payload.twelfthPassingYear,
      twelfthMarks: payload.twelfthMarks,
      twelfthPercentage: payload.twelfthPercentage,

      // =====================================================
      // GRADUATION
      // =====================================================

      graduationCollege: payload.graduationCollege,
      graduationDegree: payload.graduationDegree,
      graduationMarks: payload.graduationMarks,
      graduationPercentage: payload.graduationPercentage,
      graduationPassingYear: payload.graduationPassingYear,

      // =====================================================
      // POST GRADUATION
      // =====================================================

      postGraduationCollege:
        payload.postGraduationCollege,

      postGraduationDegree:
        payload.postGraduationDegree,

      postGraduationPassingYear:
        payload.postGraduationPassingYear,

      postGraduationMarks:
        payload.postGraduationMarks,

      postGraduationPercentage:
        payload.postGraduationPercentage,

      // =====================================================
      // DECLARATION
      // =====================================================

      declarationAccepted:
        payload.declarationAccepted
    };

    // =========================================================
    // APPEND TEXT FIELDS
    // =========================================================

    Object.entries(fields).forEach(
      ([key, value]) => {

        if (
          value !== undefined &&
          value !== null &&
          value !== ''
        ) {
          formData.append(
            key,
            String(value)
          );
        }

      }
    );

    // =========================================================
    // REQUIRED DOCUMENT FILES
    // =========================================================

    const requiredFiles = [
      'passportPhoto',
      'aadharDocument',
      'tenthMarksheet',
      'twelfthMarksheet',
      'bachelorMarksheet'
    ];

    for (const fieldName of requiredFiles) {

      const file = files[fieldName];

      if (!(file instanceof File)) {

        throw new Error(
          `${fieldName} is required.`
        );
      }

      formData.append(
        fieldName,
        file
      );
    }

    if (files.familyIncomeCertificate instanceof File) {
      formData.append(
        'familyIncomeCertificate',
        files.familyIncomeCertificate
      );
    }

    // =========================================================
    // OPTIONAL MASTER MARKSHEET
    // =========================================================

    if (
      files.masterMarksheet instanceof File
    ) {
      formData.append(
        'masterMarksheet',
        files.masterMarksheet
      );
    }

    // =========================================================
    // DEBUG
    // =========================================================

    console.log(
      '========== DOCUMENTATION FORMDATA =========='
    );

    for (const [key, value] of formData.entries()) {

      if (value instanceof File) {

        console.log(
          `${key}: FILE`,
          {
            name: value.name,
            type: value.type,
            size: value.size
          }
        );

      } else {

        console.log(
          `${key}:`,
          value
        );
      }
    }

    console.log(
      '==========================================='
    );

    // =========================================================
    // SEND TO SPRING BOOT
    // =========================================================

    // IMPORTANT:
    // DO NOT manually set Content-Type.
    // Browser/Axios automatically adds:
    //
    // multipart/form-data;
    // boundary=---------------------------
    //
    // Spring needs that boundary to parse the request.

    return api.post(
      '/api/documentations/submit',
      formData
    );
  },

  // =========================================================
  // GET DOCUMENTATION BY APPLICATION ID
  // =========================================================

  getByApplicationId: (applicationId) =>
    api.get(
      `/api/documentations/application/${applicationId}`
    ),

  getDocumentFileUrl: (applicationId, documentType) =>
    `${api.defaults.baseURL || 'http://localhost:8080'}/api/documentations/application/${applicationId}/file/${documentType}`,

  // =========================================================
  // GET ALL DOCUMENTATIONS
  // =========================================================

  getAll: () =>
    api.get(
      '/api/admin/documentations'
    ),

  // =========================================================
  // VERIFY
  // =========================================================

  verify: (
    documentId,
    remarks = ''
  ) =>
    api.patch(
      `/api/admin/documentations/${documentId}/verify`,
      null,
      {
        params: {
          remarks
        }
      }
    ),

  // =========================================================
  // REJECT
  // =========================================================

  reject: (
    documentId,
    remarks = ''
  ) =>
    api.patch(
      `/api/admin/documentations/${documentId}/reject`,
      null,
      {
        params: {
          remarks
        }
      }
    )
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
  getToppers: () => api.get('/api/student/toppers'),
  getProfile: () => api.get('/students/me'),
  updateProfile: (data) => api.put('/students/me', data)
};

export default api;
