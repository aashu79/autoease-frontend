import axios from "axios";
import { clearStoredAuth, getStoredToken } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:7193",
  timeout: 12000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken({ notifyOnExpired: true });

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredAuth({ notify: true });
    }

    return Promise.reject(error);
  },
);

export default api;
