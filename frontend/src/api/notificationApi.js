import api from './apiServices';

export const getStudentNotifications = async () => {
  return api.get('/student/notifications');
};

export const getUnreadNotificationCount = async () => {
  return api.get('/student/notifications/unread-count');
};

export const markNotificationAsRead = async (id) => {
  return api.put(`/student/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async () => {
  return api.put('/student/notifications/read-all');
};
