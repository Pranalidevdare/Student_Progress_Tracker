import api from './axios';

export const getAttendanceByBatch = (batchId) =>
  api.get(`/api/trainer/attendance/batch/${batchId}`);

export const getTodayAttendance = (batchId, date, sessionType) =>
  api.get('/api/trainer/attendance/today', {
    params: { batchId, date, sessionType }
  });

export const markAttendance = (data) =>
  api.post('/api/trainer/attendance', data);

export const bulkMarkAttendance = (data) =>
  api.post('/api/trainer/attendance/bulk', data);

export const updateAttendance = (id, data) =>
  api.put(`/api/trainer/attendance/${id}`, data);

export const getStudentMonthlyAttendance = (studentId, month, year) =>
  api.get(`/api/trainer/attendance/student/${studentId}/monthly`, {
    params: { month, year }
  });

export const getAttendanceHistory = (batchId, date, sessionType) =>
  api.get('/api/trainer/attendance/history', {
    params: { batchId, date, sessionType }
  });
