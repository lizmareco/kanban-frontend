import axios from 'axios';

let token = null;

// Verificar si se está en el entorno del navegador para acceder a localStorage
if (typeof window !== 'undefined') {
  token = localStorage.getItem('token');
}

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '' // Solo añadir el token si está disponible
  },
});

export default axiosInstance;










