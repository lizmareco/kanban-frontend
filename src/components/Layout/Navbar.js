// src/components/Layout/Navbar.js

import { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AuthContext from '../../context/AuthContext';

const Navbar = () => {
  const router = useRouter();
  const { user, logoutUser } = useContext(AuthContext);

  const handleLogout = () => {
    logoutUser(); // Elimina el token y limpia el estado del usuario
    router.push('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link href="/" passHref>
            KanbanApp
          </Link>
        </Typography>
        <Typography variant="body1" color="inherit" sx={{ mr: 2 }}>
        <Link href="/workspaces" passHref>
          <Button color="inherit">Espacios de Trabajo</Button>
        </Link>
        </Typography>
        {user ? (
          <>
            <Typography variant="body1" color="inherit" sx={{ mr: 2 }}>
              Bienvenido, {user.nombre} {/* Mostrar el nombre del usuario logueado */}
            </Typography>
            <Button color="secondary" variant="contained" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </>
        ) : (
          <Typography variant="body1" color="inherit" sx={{ mr: 2 }}>
          <Link href="/login" passHref>
            <Button color="inherit">Iniciar Sesión</Button>
          </Link>
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;



