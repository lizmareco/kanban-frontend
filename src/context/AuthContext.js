// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

 // Función para iniciar sesión en AuthContext.js
const loginUser = async (email, password) => {
  try {
    console.log('Intentando iniciar sesión con:', { email, password });
    const response = await axiosInstance.post('/auth/login', { email, password });
    console.log('Login exitoso:', response.data);

    const { token, user } = response.data;

    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    toast.success('Inicio de sesión exitoso.');
    router.push('/workspaces');

    return { success: true };
  } catch (err) {
    console.log('Entró al catch de loginUser');
    console.error('Error en el login:', err.message);

    if (err.response && err.response.data) {
      const errorMsg = err.response.data.msg || 'Error en el inicio de sesión.';
      setError(errorMsg);
      toast.error(errorMsg);
      // IMPORTANT: No lanzar error.
      return { success: false, message: errorMsg };
    } else {
      const genericError = 'Error en el inicio de sesión. Por favor, intenta nuevamente.';
      setError(genericError);
      toast.error(genericError);
      return { success: false, message: genericError };
    }
  }
};


  const registerUser = async (nombre, email, password) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        nombre,
        email,
        password,
      });
      toast.success('Registro exitoso. Por favor, inicia sesión.');
      return { success: true };
    } catch (error) {
      if (error.response) {
        console.error('Error en registerUser:', error.response.data);
        toast.error(error.response.data.msg || 'Error en el registro.');
      } else {
        const genericError = 'Error en el servidor. Intenta nuevamente.';
        console.error('Error en registerUser:', genericError);
        toast.error(genericError);
      }
    }
  };

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












