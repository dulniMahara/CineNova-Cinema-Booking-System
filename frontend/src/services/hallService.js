import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/halls`;

export const getHalls = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createHall = async (hallData) => {
  const response = await axios.post(API_URL, hallData);
  return response.data;
};

// --- ADD THIS (For Edit) ---
export const updateHall = async (id, hallData) => {
  const response = await axios.put(`${API_URL}/${id}`, hallData);
  return response.data;
};

// --- THIS IS FOR DELETE ---
export const deleteHall = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};