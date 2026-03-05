import axios from "axios";

/**
 * Base URL of FastAPI backend
 * Prioritizes Vercel Env Var, then Production URL, then Localhost
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://dinevibe1.vercel.app" || "http://localhost:8001";

/**
 * Axios instance
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 🔐 REQUEST INTERCEPTOR
 * Attaches JWT token to EVERY protected request
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 🚨 RESPONSE INTERCEPTOR
 * Auto logout on token expiry / invalid token
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired. Logging out.");

      localStorage.removeItem("access_token");
      sessionStorage.removeItem("temp_token");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;