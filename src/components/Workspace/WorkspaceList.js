import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Grid, Card, CardContent, Typography, Button, Box, CircularProgress, IconButton, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

const WorkspaceList = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Estados para edición del nombre del workspace
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [editedWorkspaceName, setEditedWorkspaceName] = useState('');

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleInactivateWorkspace = async (workspaceId) => {
    try {
      await axiosInstance.put(`/workspaces/${workspaceId}/deactivate`);
      toast.success('Espacio de trabajo inactivado correctamente.');
      setWorkspaces((prevWorkspaces) => prevWorkspaces.filter((workspace) => workspace.id !== workspaceId));
    } catch (error) {
      console.error('Error al inactivar el espacio de trabajo:', error);
      toast.error('Error al inactivar el espacio de trabajo.');
    }
  };

  // Función para iniciar la edición del nombre del workspace
  const startEditingWorkspaceName = (workspace) => {
    setEditingWorkspaceId(workspace.id);
    setEditedWorkspaceName(workspace.nombre);
  };

  // Función para cancelar la edición del nombre del workspace
  const cancelEditingWorkspaceName = () => {
    setEditingWorkspaceId(null);
    setEditedWorkspaceName('');
  };

  // Función para guardar el nombre del workspace editado
  const handleWorkspaceNameChange = async () => {
    if (!editedWorkspaceName.trim()) {
      toast.error('El nombre no puede estar vacío.');
      return;
    }

    try {
      await axiosInstance.put(`/workspaces/${editingWorkspaceId}`, {
        nombre: editedWorkspaceName.trim()
      });
      // Actualizar el nombre del workspace en el estado local
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.id === editingWorkspaceId ? { ...ws, nombre: editedWorkspaceName.trim() } : ws
        )
      );
      toast.success('Nombre del espacio de trabajo actualizado.');
      setEditingWorkspaceId(null);
      setEditedWorkspaceName('');
    } catch (error) {
      console.error('Error al actualizar el nombre del workspace:', error);
      toast.error('Error al actualizar el nombre del espacio de trabajo.');
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
                {editingWorkspaceId === workspace.id ? (
                  <Box display="flex" alignItems="center" mb={2}>
                    <TextField
                      value={editedWorkspaceName}
                      onChange={(e) => setEditedWorkspaceName(e.target.value)}
                      variant="outlined"
                      sx={{ mr: 1, flexGrow: 1 }}
                    />
                    <IconButton color="primary" onClick={handleWorkspaceNameChange}>
                      <CheckIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={cancelEditingWorkspaceName}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h5" component="div" noWrap>
                      {workspace.nombre}
                    </Typography>
                    <IconButton color="primary" onClick={() => startEditingWorkspaceName(workspace)}>
                      <EditIcon />
                    </IconButton>
                  </Box>
                )}

                <Typography variant="body2" color="text.secondary" mb={2} noWrap>
                  {workspace.descripcion}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push(`/workspaces/${workspace.id}/boards`)}
                  sx={{ mr: 2 }}
                >
                  Ver Tablero
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





