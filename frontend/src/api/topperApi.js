import api from './axios';

export const getAllToppers = () => api.get('/api/trainer/toppers');
export const getToppersByBatch = (batchId) => api.get(`/api/trainer/toppers/batch/${batchId}`);
export const getTopRankers = (limit) => api.get(`/api/trainer/toppers/top/${limit}`);
