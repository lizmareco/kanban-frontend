// components/Board/CardForm.js
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Box, Button, TextField, Typography, CircularProgress, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const CardForm = ({ listId, onCardAdded, workspaceId }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioAsignado, setUsuarioAsignado] = useState('');
  const [loading, setLoading] = useState(true);

  // Obtener la lista de usuarios asignados al workspace actual
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await axiosInstance.get(`/workspaces/${workspaceId}/users`); 
        setUsuarios(res.data);
      } catch (err) {
        console.error('Error al obtener los usuarios:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, [workspaceId]);

  const onSubmit = async (data) => {
    const today = new Date();
    const selectedDate = new Date(data.fecha_vencimiento);

    if (selectedDate < today.setHours(0, 0, 0, 0)) {
      alert("La fecha de vencimiento no puede ser anterior a la fecha actual.");
      return;
    }

    try {
      console.log('Datos enviados al backend:', { ...data, lista_id: listId, usuario_asignado: usuarioAsignado });
      await axiosInstance.post('/cards', { ...data, lista_id: listId, usuario_asignado: usuarioAsignado });
      onCardAdded();
    } catch (error) {
      console.error('Error al agregar tarjeta:', error);
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
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ mt: 2, p: 2, border: '1px solid grey', borderRadius: 2 }}
    >
      <Typography variant="h6" mb={2}>
        Agregar Nueva Tarjeta
      </Typography>
      <TextField
        label="Título de la tarjeta"
        {...register('nombre', { required: 'El título es obligatorio' })}
        fullWidth
        margin="normal"
        required
        error={!!errors.nombre}
        helperText={errors.nombre?.message}
      />
      <TextField
        label="Descripción"
        {...register('descripcion')}
        fullWidth
        multiline
        rows={3}
        margin="normal"
      />
      <TextField
        label="Fecha de vencimiento"
        type="date"
        {...register('fecha_vencimiento', {
          required: 'La fecha de vencimiento es obligatoria',
          validate: (value) => {
            const today = new Date();
            const selectedDate = new Date(value);
            if (selectedDate < today.setHours(0, 0, 0, 0)) {
              return 'La fecha de vencimiento no puede ser anterior a la fecha actual';
            }
            return true;
          },
        })}
        fullWidth
        InputLabelProps={{ shrink: true }}
        margin="normal"
        error={!!errors.fecha_vencimiento}
        helperText={errors.fecha_vencimiento?.message}
      />
      <TextField
        label="Etiqueta"
        {...register('etiqueta')}
        fullWidth
        margin="normal"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="usuario-asignado-label">Asignar Usuario</InputLabel>
        <Select
          labelId="usuario-asignado-label"
          value={usuarioAsignado}
          onChange={(e) => setUsuarioAsignado(e.target.value)}
          required
        >
          {usuarios.map((usuario) => (
            <MenuItem key={usuario.id} value={usuario.id}>
              {usuario.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Agregar Tarjeta
      </Button>
    </Box>
  );
};

export default CardForm;





