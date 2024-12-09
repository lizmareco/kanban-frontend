// src/components/Auth/CustomRegisterForm.js

import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { toast } from 'react-toastify'; // Asegúrate de haber importado react-toastify si lo necesitas

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

const CustomRegisterForm = () => {
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
  const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });

  const handleAlert = (type, message) => {
    setAlertMessage({ type, text: message });
    // Si quieres que la alerta desaparezca luego de unos segundos:
    setTimeout(() => {
      setAlertMessage({ type: '', text: '' });
    }, 5000);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data.nombre, data.email, data.password);
      handleAlert('success', 'Registro exitoso.');
      // No redirigir aquí, lo haremos en el finally
      router.push('/workspaces');
    } catch (error) {
      console.error('Error capturado en CustomRegisterForm:', error);
      if (error.response) {
        if (error.response.status === 400) {
          const errorMessage = error.response.data.msg || 'Error en la solicitud';
          handleAlert('error', errorMessage);
        } else {
          handleAlert('error', 'Error del servidor. Por favor, intenta más tarde.');
        }
      } else {
        handleAlert('error', 'Error al realizar la solicitud. Por favor, verifica tu conexión.');
      }
    } 
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        maxWidth: '400px',
        margin: '0 auto',
        padding: '2rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Registrar nuevo usuario
      </Typography>

      {alertMessage.text && (
        <Alert severity={alertMessage.type} sx={{ mb: 2 }}>
          {alertMessage.text}
        </Alert>
      )}

      <TextField
        label="Nombre"
        variant="outlined"
        fullWidth
        margin="normal"
        {...register('nombre')}
        error={!!errors.nombre}
        helperText={errors.nombre?.message}
      />

      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        type="email"
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <TextField
        label="Contraseña"
        variant="outlined"
        fullWidth
        margin="normal"
        type="password"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
      />

      <TextField
        label="Confirmar Contraseña"
        variant="outlined"
        fullWidth
        margin="normal"
        type="password"
        {...register('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Registrar usuario'}
      </Button>
    </Box>
  );
};

export default CustomRegisterForm;


