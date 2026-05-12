import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE ?? `${import.meta.env.BASE_URL}api`;

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10_000,
  headers: { Accept: "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[api] request failed", error?.config?.url, error?.message);
    return Promise.reject(error);
  },
);
