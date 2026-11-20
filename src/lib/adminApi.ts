/// <reference types="vite/client" />
import axios from 'axios';
import { useAdminStore } from '../store/admin.store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const adminApi = axios.create({
  baseURL: `${API_URL}/api/admin`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach admin JWT to every request
adminApi.interceptors.request.use((config) => {
  const token = useAdminStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 — clear admin session and redirect to admin login
adminApi.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      useAdminStore.getState().logout();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
