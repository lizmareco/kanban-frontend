// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios'; // Asegúrate de importar axios
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

// Crear el contexto de autenticación
export const AuthContext = createContext();

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar el token y el usuario desde el Local Storage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // Función para iniciar sesión
  const loginUser = async (email, password) => {
    try {
      console.log('Intentando iniciar sesión con:', { email, password });
      const response = await axios.post('http://localhost:3001/auth/login', {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Login exitoso:', response.data);

      const { token, user } = response.data;

      // Guardar token y usuario en el estado y en Local Storage
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Mostrar notificación de éxito
      toast.success('Inicio de sesión exitoso.');

      // Redirigir al usuario a la página principal o a donde desees
      router.push('/workspaces');
    } catch (err) {
      console.error('Error en el login:', err);

      // Manejar errores y mostrar notificación
      if (err.response && err.response.data) {
        const errorMsg = err.response.data.msg || 'Error en el inicio de sesión.';
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        setError('Error en el inicio de sesión. Por favor, intenta nuevamente.');
        toast.error('Error en el inicio de sesión. Por favor, intenta nuevamente.');
      }
    }
  };

  // Función para registrar un nuevo usuario
  const registerUser = async (nombre, email, password) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        nombre,
        email,
        password,
      });
      toast.success('Registro exitoso. Por favor, inicia sesión.');
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error en registerUser:', error.response.data);
        throw error; // Lanzar el error para que el componente `RegisterForm.js` lo maneje
      } else {
        toast.error('Error en el servidor. Intenta nuevamente.');
        throw error;
      }
    }
  };

  // Función para cerrar sesión
  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, registerUser, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;




