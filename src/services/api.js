import axios from "axios";

// In production the frontend is served by the same Express server,
// so /api is always on the same origin — no absolute URL needed.
// In development Vite proxies /api -> http://localhost:5000 (see vite.config.js).
const api = axios.create({
  baseURL: "/api",
});

// Automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;