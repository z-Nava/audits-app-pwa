// src/services/api.ts
import axios from "axios";
import { useUserStore } from "../store/userStore";

const baseURL =
  (import.meta as any).env?.VITE_API_BASE || "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
  },
});

// Antes de cada request, le mete el Bearer token si existe
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
