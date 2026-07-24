import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/movies`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
};

// Get all movies
export const getMovies = async (params = {}) => {
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== "") {
      cleanParams[key] = params[key];
    }
  });

  const headers = getAuthHeader().headers;

  const response = await axios.get(API_URL, {
    headers,
    params: cleanParams,
  });

  return response.data;
};

// Get a single movie
export const getMovieById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

// Create a new movie
export const createMovie = async (movieData) => {
  const response = await axios.post(API_URL, movieData, getAuthHeader());
  return response.data;
};

// Update a movie
export const updateMovie = async (id, movieData) => {
  const response = await axios.put(`${API_URL}/${id}`, movieData, getAuthHeader());
  return response.data;
};

// Delete a movie
export const deleteMovie = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};