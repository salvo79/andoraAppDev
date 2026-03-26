// src/services/api.js

import axios from "axios";

const api = axios.create({
  baseURL: "/api", // 👈 CLAVE
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 10000
});

// interceptor JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/landing/login";
    }
    return Promise.reject(error);
  }
);

export default api;