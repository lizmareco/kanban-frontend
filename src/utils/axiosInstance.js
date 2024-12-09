// src/utils/axiosInstance.js
import axios from 'axios';

// Crear una instancia de axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001', // Asegúrate de que esta URL sea correcta
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a cada solicitud si está disponible
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promime.reject(error);
  }
);



export default axiosInstance;
















