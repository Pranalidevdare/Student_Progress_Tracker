import api from './axios';

export const getToppersByBatch = (batchId) =>
  api.get(`/api/student/toppers/batch/${batchId || 'BATCH001'}`);

export const getAllToppers = () =>
  api.get('/api/student/toppers');

export const getTopRankers = (limit) =>
  api.get(`/api/student/toppers/top/${limit}`);
