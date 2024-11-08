// src/components/Layout/Navbar.js

import { useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AuthContext from '../../context/AuthContext';

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
      router.push(`/workspaces/${router.query.workspaceId}/boards/${router.query.boardId}/dashboard`);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Icono de menú */}
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={handleMenuClick}>
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
            <MenuItem onClick={handleDashboardClick}>Ver Dashboard</MenuItem>
          )}
        </Menu>

        {/* Título de la aplicación */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link href="/" passHref>
            KanbanApp
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




