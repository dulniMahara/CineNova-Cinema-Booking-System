import API from './api';

export const getHalls = async () => {
  const response = await API.get('/halls');
  return response.data;
};

export const createHall = async (hallData) => {
  const response = await API.post('/halls', hallData);
  return response.data;
};

export const updateHall = async (id, hallData) => {
  const response = await API.put(`/halls/${id}`, hallData);
  return response.data;
};

export const deleteHall = async (id) => {
  const response = await API.delete(`/halls/${id}`);
  return response.data;
};