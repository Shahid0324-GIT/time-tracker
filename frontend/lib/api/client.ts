import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/lib/stores/authStore";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: BASE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
