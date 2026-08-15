import api from './axios';

export const getFeedbackByTrainer = (trainerId) =>
  api.get(`/api/trainer/feedback/${trainerId}`);

export const submitStudentFeedback = (data) =>
  api.post('/api/student/feedback', data);

export const getStudentFeedback = (studentId) =>
  api.get(`/api/student/feedback/${studentId}`);
