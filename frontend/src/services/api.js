import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://hotel-management-system-1-6mjc.onrender.com"
});

// Automatically inject JWT token into requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;