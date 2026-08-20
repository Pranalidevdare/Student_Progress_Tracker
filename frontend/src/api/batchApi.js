import api from './axios';

export const batchApi = {
  // Get all batches (Admin)
  getAllBatches: () => api.get('/batches'),

  // Get active batches
  getActiveBatches: () => api.get('/batches/active'),

  // Get batches assigned to logged-in trainer
  getMyBatches: () => api.get('/batches/my-batches'),

  // Get batches by specific trainer ID
  getTrainerBatches: (trainerId) => api.get(`/batches/trainer/${trainerId}`),

  // Get single batch details by ID
  getBatchById: (batchId) => api.get(`/batches/${batchId}`),

  // Get students enrolled in a batch
  getBatchStudents: (batchId) => api.get(`/batches/${batchId}/students`),

  // Create new batch (Admin)
  createBatch: (data) => api.post('/batches/create', data),

  // Get eligible candidates (Applications with status = SELECTED)
  getSelectedApplications: async () => {
    try {
      const res = await api.get('/admin/applications/getAll');
      const list = Array.isArray(res.data) ? res.data : [];
      return list.filter(app => app.status === 'SELECTED');
    } catch (err) {
      const res = await api.get('/applications');
      const list = Array.isArray(res.data) ? res.data : [];
      return list.filter(app => app.status === 'SELECTED');
    }
  },

  // Get active trainers for dropdowns
  getTrainers: async () => {
    try {
      const res = await api.get('/admin/trainers/getAll');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      const res = await api.get('/trainers');
      return Array.isArray(res.data) ? res.data : [];
    }
  }
};

export default batchApi;
