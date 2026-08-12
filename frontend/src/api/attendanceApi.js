import api from './axios';

export const getAttendanceByBatch = (batchId) =>
  api.get(`/api/trainer/attendance/batch/${batchId}`);

export const markAttendance = (data) =>
  api.post('/api/trainer/attendance', data);

export const updateAttendance = (id, data) =>
  api.put(`/api/trainer/attendance/${id}`, data);
