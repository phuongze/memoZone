import axios from "axios";

function resolveApiBaseURL() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (import.meta.env.DEV) {
    return "http://localhost:5000/api";
  }

  return "/api";
}

const api = axios.create({
  baseURL: resolveApiBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("oss_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
