import api from './axios';

export const getFeedbackByTrainer = (trainerId) =>
  api.get(`/api/trainer/feedback/${trainerId}`);
