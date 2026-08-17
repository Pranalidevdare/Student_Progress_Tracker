import api from './axios';

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/trainer/files/upload', formData);
};
