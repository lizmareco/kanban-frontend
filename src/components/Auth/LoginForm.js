// src/components/Auth/LoginForm.js
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useContext } from 'react';
//import AuthContext from '../../context/AuthContext';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Link from 'next/link'; // Importamos Link de Next.js




const schema = yup.object().shape({
  email: yup.string().email('Email inválido').required('El email es obligatorio'),
  password: yup.string().required('La contraseña es obligatoria'),
});

const LoginForm = () => {
  const { loginUser } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      await loginUser(data.email, data.password);
      router.push('/workspaces'); // Redirige al usuario después de iniciar sesión
    } catch (error) {
      toast.error('Credenciales incorrectas');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
      <h2>Iniciar Sesión</h2>
      <input type="email" placeholder="Email" {...register('email')} className="input-field" />
      <p className="error-message">{errors.email?.message}</p>

      <input type="password" placeholder="Contraseña" {...register('password')} className="input-field" />
      <p className="error-message">{errors.password?.message}</p>

      <button type="submit" className="submit-button">Iniciar Sesión</button>

      <p className="register-link">
        ¿No tienes una cuenta?{' '}
        <Link href="/register">Regístrate aquí</Link>
      </p>
    </form>
  );
};

export default LoginForm;



