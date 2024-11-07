// src/components/Workspace/WorkspaceList.js
import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Grid, Card, CardContent, Typography, Button, Box, CircularProgress } from '@mui/material';

const WorkspaceList = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await axiosInstance.get('/workspaces');
        setWorkspaces(res.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          toast.error('No autorizado. Por favor, inicia sesión nuevamente.');
          router.push('/login');
        } else {
          console.error('Error al obtener los espacios de trabajo:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [router]);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Función para inactivar un espacio de trabajo
  const handleInactivateWorkspace = async (workspaceId) => {
    try {
      // Asegúrate de que la URL incluya "/deactivate" para inactivar el workspace
      await axiosInstance.put(`/workspaces/${workspaceId}/deactivate`);
      toast.success('Espacio de trabajo inactivado correctamente.');
      setWorkspaces((prevWorkspaces) => prevWorkspaces.filter((workspace) => workspace.id !== workspaceId));
    } catch (error) {
      console.error('Error al inactivar el espacio de trabajo:', error);
      toast.error('Error al inactivar el espacio de trabajo.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Espacios de Trabajo</Typography>
      </Box>
      <Grid container spacing={4}>
        {workspaces.map((workspace) => (
          <Grid item xs={12} sm={6} md={4} key={workspace.id}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  {workspace.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {workspace.descripcion}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push(`/workspaces/${workspace.id}/boards`)}
                  sx={{ mr: 2 }}
                >
                  Ver Tableros
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => handleInactivateWorkspace(workspace.id)}
                >
                  Inactivar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WorkspaceList;




