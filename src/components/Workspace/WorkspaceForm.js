// src/components/Workspace/WorkspaceForm.js

import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { TextField, Button, Box, Typography, MenuItem, CircularProgress, Select, InputLabel, FormControl } from '@mui/material';

const WorkspaceForm = () => {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosAsignados, setUsuariosAsignados] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Obtener la lista de usuarios disponibles
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        console.log('Intentando obtener usuarios. Token:', localStorage.getItem('token'));
        const res = await axiosInstance.get('http://localhost:3001/users');
        setUsuarios(res.data);
      } catch (err) {
        console.error('Error al obtener los usuarios:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);
  

  // Manejar el envío del formulario
  const onSubmit = async (data) => {
    try {
      // Enviar solicitud POST para crear el espacio de trabajo con los usuarios asignados
      await axiosInstance.post('/workspaces', { ...data, usuariosAsignados });
      
      // Mostrar notificación de éxito
      toast.success('Espacio de trabajo creado exitosamente.');
      router.push('/workspaces');
    } catch (err) {
      console.error('Error al crear el espacio de trabajo:', err);
      toast.error('Error al crear el espacio de trabajo.');
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
    <Box p={4} maxWidth="600px" mx="auto">
      <Typography variant="h4" mb={4}>Crear Espacio de Trabajo</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Nombre del Espacio de Trabajo"
          {...register('nombre', { required: 'El nombre es obligatorio' })}
          error={!!errors.nombre}
          helperText={errors.nombre?.message}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Descripción"
          {...register('descripcion')}
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="usuarios-label">Asignar Usuarios</InputLabel>
          <Select
            labelId="usuarios-label"
            multiple
            value={usuariosAsignados}
            onChange={(e) => setUsuariosAsignados(e.target.value)}
            renderValue={(selected) => selected.map((userId) => {
              const user = usuarios.find(u => u.id === userId);
              return user ? `${user.nombre} (${user.email})` : '';
            }).join(', ')}
          >
            {usuarios.map((usuario) => (
              <MenuItem key={usuario.id} value={usuario.id}>
                {usuario.nombre} ({usuario.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 3 }}>
          Crear Espacio de Trabajo
        </Button>
      </form>
    </Box>
  );
};

export default WorkspaceForm;







