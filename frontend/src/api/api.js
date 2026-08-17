import api from './axios';

export const getAllStudents          = ()         => api.get('/students');
export const getCurrentStudent        = ()         => api.get('/students/me');
export const getMyStudentProfile      = ()         => api.get('/students/me');
export const updateCurrentStudent     = (data)     => api.put('/students/me', data);
export const updateMyStudentProfile  = (data)     => api.put('/students/me', data);
export const getStudentById          = (id)       => api.get(`/students/${id}`);
export const updateStudent           = (id, data) => api.put(`/students/${id}`, data);

export default api;