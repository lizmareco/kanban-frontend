// src/components/Auth/RegisterForm.js

import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

const schema = yup.object().shape({
  nombre: yup.string().required('El nombre es obligatorio'),
  email: yup.string().email('Email inválido').required('El email es obligatorio'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
});

const RegisterForm = () => {
  const { registerUser } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Función para mostrar el mensaje de alerta durante un tiempo determinado
  const handleAlert = (message) => {
    setAlertMessage(message);
    setTimeout(() => {
      setAlertMessage('');
    }, 5000); // El mensaje de alerta se mostrará durante 5 segundos
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data.nombre, data.email, data.password);
      handleAlert('Registro exitoso. Por favor, inicia sesión.');
      router.push('/login');
    } catch (error) {
      console.error('Error capturado en RegisterForm:', error);
      if (error.response) {
        if (error.response.status === 400) {
          const errorMessage = error.response.data.msg || 'Error en la solicitud';
          handleAlert(errorMessage);
        } else {
          handleAlert('Error del servidor. Por favor, intenta más tarde.');
        }
      } else {
        handleAlert('Error al realizar la solicitud. Por favor, verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="register-form">
      <h2>Regístrate</h2>

      {alertMessage && (
        <div className="alert-message">
          {alertMessage}
        </div>
      )}

      <input
        type="text"
        placeholder="Nombre"
        {...register('nombre')}
        className="input-field"
      />
      <p className="error-message">{errors.nombre?.message}</p>

      <input
        type="email"
        placeholder="Email"
        {...register('email')}
        className="input-field"
      />
      <p className="error-message">{errors.email?.message}</p>

      <input
        type="password"
        placeholder="Contraseña"
        {...register('password')}
        className="input-field"
      />
      <p className="error-message">{errors.password?.message}</p>

      <input
        type="password"
        placeholder="Confirmar Contraseña"
        {...register('confirmPassword')}
        className="input-field"
      />
      <p className="error-message">{errors.confirmPassword?.message}</p>

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>

      <p className="login-link">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login">Inicia sesión aquí</Link>
      </p>
    </form>
  );
};

export default RegisterForm;







