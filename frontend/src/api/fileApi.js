import api from './axios';

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/trainer/files/upload', formData, {
    transformRequest: [(data, headers) => {
      delete headers['Content-Type'];
      return data;
    }],
  });
};
