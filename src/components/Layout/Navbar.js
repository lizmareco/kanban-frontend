// src/components/Layout/Navbar.js

import { useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { AuthContext } from '../../context/AuthContext';
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // Importa el ícono si lo usas
import DashboardIcon from '@mui/icons-material/Dashboard';

const Navbar = () => {
  const router = useRouter();
  const { user, logoutUser } = useContext(AuthContext);

  // Estado para el menú
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutUser(); // Elimina el token y limpia el estado del usuario
    router.push('/login');
  };

  // Redirigir al dashboard del tablero actual
  const handleDashboardClick = () => {
    handleMenuClose();
    if (router.query.boardId) {
      router.push(
        `/workspaces/${router.query.workspaceId}/boards/${router.query.boardId}/dashboard`
      );
    }
  };

  // Redirigir a la página de registro personalizado
  const handleAdminRegisterClick = () => {
    handleMenuClose();
    router.push('/admin/register');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Icono de menú */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={handleMenuClick}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {/* Mostrar opción de ver el dashboard solo si está en un tablero */}
          {router.query.boardId && (
            <MenuItem onClick={handleDashboardClick}>
              <DashboardIcon sx={{ mr: 1 }} /> {/* Añade margen a la derecha del ícono */}
                Ver Dashboard
              </MenuItem>
          )}

          {/* Opción para registrar usuario personalizado, solo visible si el usuario está autenticado */}
          {user && (
            <MenuItem onClick={handleAdminRegisterClick}>
              <PersonAddIcon sx={{ mr: 1 }} />
              Registrar Usuario
            </MenuItem>
          )}
        </Menu>

        {/* Título de la aplicación */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link href="/" passHref>
            <Button color="inherit">KanbanApp</Button>
          </Link>
        </Typography>

        {/* Espacios de Trabajo */}
        <Typography variant="body1" color="inherit" sx={{ mr: 2 }}>
          <Link href="/workspaces" passHref>
            <Button color="inherit">Espacios de Trabajo</Button>
          </Link>
        </Typography>

        {/* Mostrar si el usuario está autenticado */}
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





