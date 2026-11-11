import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

// Adjunta el token guardado en cada peticion
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gym_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el token expira/es invalido, regresa al login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("gym_token");
      localStorage.removeItem("gym_usuario");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
