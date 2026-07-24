import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/showtimes`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
};

export const getShowtimes = async (params = {}) => {
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== "") {
      cleanParams[key] = params[key];
    }
  });

  const response = await axios.get(API_URL, {
    ...getAuthHeader(),
    params: cleanParams,
  });
  return response.data;
};

export const getShowtimeById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const createShowtime = async (showtimeData) => {
  const response = await axios.post(API_URL, showtimeData, getAuthHeader());
  return response.data;
};

export const updateShowtime = async (id, showtimeData) => {
  const response = await axios.put(`${API_URL}/${id}`, showtimeData, getAuthHeader());
  return response.data;
};

export const deleteShowtime = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const getShowtimesByMovie = async (movieId) => {
  const response = await axios.get(`${API_URL}/movie/${movieId}`);
  return response.data;
};