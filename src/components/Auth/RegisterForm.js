// src/components/Auth/RegisterForm.js

import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, Button, TextField, Typography } from '@mui/material';
import { toast } from 'react-toastify'; // Importar toast de react-toastify

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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('Datos del formulario:', data);

      // registerUser lanza error si algo falla, por eso mantenemos el try-catch
      await registerUser(data.nombre, data.email, data.password);

      // Como el registro fue exitoso, mostramos un toast de éxito
      toast.success('Registro exitoso. Por favor, inicia sesión.');
      router.push('/login');
    } catch (error) {
      console.error('Error capturado en RegisterForm:', error.response ? error.response.data : error.message);
      // Aquí manejamos el error lanzado por registerUser
      if (error.response) {
        if (error.response.status === 400) {
          const errorMessage = error.response.data.msg || 'Error en la solicitud';
          toast.error(errorMessage); // Mostrar error con toast.error
        } else {
          toast.error('Error del servidor. Por favor, intenta más tarde.');
        }
      } else {
        toast.error('Error al realizar la solicitud. Por favor, verifica tu conexión.');
      }
    } finally {
      setLoading(false);
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
        Regístrate
      </Typography>

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
        {loading ? 'Registrando...' : 'Registrarse'}
      </Button>

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login">Inicia sesión aquí</Link>
      </Typography>
    </Box>
  );
};

export default RegisterForm;












