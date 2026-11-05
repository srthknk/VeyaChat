import axios from 'axios';
import { useAuthStore } from '../store/index.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to headers
client.interceptors.request.use((config) => {
  let storedToken = null;
  try {
    storedToken = localStorage.getItem('token');
  } catch (error) {
    console.warn('Persistent browser storage is unavailable; using the active session:', error);
  }
  const token = storedToken || useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
