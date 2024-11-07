// src/components/Board/BoardForm.js
import { useForm } from 'react-hook-form';
import axiosInstance from '../../utils/axiosInstance';
import { useRouter } from 'next/router';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { useState } from 'react';

const BoardForm = ({ workspaceId }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/boards', { ...data, workspaceId });
      const newBoardId = response.data.id;
      // Redirigir al tablero recién creado
      router.push(`/workspaces/${workspaceId}/boards/${newBoardId}`);
    } catch (error) {
      console.error('Error al crear el tablero:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} maxWidth="600px" mx="auto">
      <Typography variant="h4" mb={4}>Crear Tablero</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Nombre del Tablero"
          {...register('nombre', { required: 'El nombre es obligatorio' })}
          error={!!errors.nombre}
          helperText={errors.nombre?.message}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Descripción del Tablero"
          {...register('descripcion')}
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Crear Tablero'}
        </Button>
      </form>
    </Box>
  );
};

export default BoardForm;



