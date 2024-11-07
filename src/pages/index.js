// src/pages/index.js
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import LoginForm from '../components/Auth/LoginForm';
//import AuthContext from '../context/AuthContext';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/workspaces'); // Redirige a los usuarios autenticados
    }
  }, [user]);

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <LoginForm />
    </div>
  );
}

