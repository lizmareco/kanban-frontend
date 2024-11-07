import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '/src/utils/axiosInstance';
import { Box, Button, TextField, Typography, IconButton, CircularProgress, Grid, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CardForm from '/src/components/Board/CardForm';

const BoardPage = () => {
  const router = useRouter();
  const { workspaceId, boardId } = router.query;

  const [lists, setLists] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [maxWIP, setMaxWIP] = useState('');
  const [usuarioFiltro, setUsuarioFiltro] = useState('');
  const [etiquetaFiltro, setEtiquetaFiltro] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editedListName, setEditedListName] = useState('');
  const [showCardFormForList, setShowCardFormForList] = useState(null); // Lista para la cual se está mostrando el formulario
  const [dialogOpen, setDialogOpen] = useState(false); // Estado para el diálogo emergente
  const [showDeleteCardDialog, setShowDeleteCardDialog] = useState(false); // Estado para mostrar el diálogo de eliminación de tarjeta
  const [cardToDelete, setCardToDelete] = useState(null); // Tarjeta seleccionada para eliminar

  const handleCardAdded = async () => {
    // Actualizar las listas después de agregar una tarjeta
    const res = await axiosInstance.get(`/lists/board/${boardId}`);
    setLists(res.data);
    setDialogOpen(false); // Cerrar el diálogo después de agregar la tarjeta
  };

  useEffect(() => {
    if (workspaceId && boardId) {
      const fetchLists = async () => {
        try {
          console.log('Obteniendo listas para el workspaceId:', workspaceId, 'y boardId:', boardId);
          const res = await axiosInstance.get(`/lists/board/${boardId}`);
          console.log('Respuesta del servidor al obtener las listas:', res.data);
          setLists(res.data);
        } catch (error) {
          console.error('Error al obtener las listas:', error.response ? error.response.data : error.message);
          if (error.response && error.response.status === 401) {
            alert('Sesión expirada, por favor inicia sesión nuevamente.');
            router.push('/login');
          }
        } finally {
          setLoading(false);
        }
      };

      const fetchUsuarios = async () => {
        try {
          const res = await axiosInstance.get('/users');
          setUsuarios(res.data);
        } catch (error) {
          console.error('Error al obtener los usuarios:', error);
        }
      };

      fetchLists();
      fetchUsuarios();
    }
  }, [workspaceId, boardId]);

  useEffect(() => {
    // Recopilar etiquetas únicas de las listas cargadas
    const etiquetasSet = new Set();
    lists.forEach(list => {
      if (list.cards && Array.isArray(list.cards)) {
        list.cards.forEach(card => {
          if (card.etiqueta) {
            etiquetasSet.add(card.etiqueta);
          }
        });
      }
    });
    setEtiquetas([...etiquetasSet]);
  }, [lists]);

  // Filtrar las tarjetas según el usuario asignado y la etiqueta
  const filtrarTarjetas = (cards = []) => {
    return cards.filter((card) => {
      const coincideUsuario = !usuarioFiltro || card.usuario_asignado === parseInt(usuarioFiltro);
      const coincideEtiqueta = !etiquetaFiltro || (card.etiqueta && card.etiqueta.includes(etiquetaFiltro));
      return coincideUsuario && coincideEtiqueta;
    });
  };

  // Agregar una nueva lista
  const handleAddList = async () => {
    if (!newListName || !maxWIP) {
      return;
    }
    try {
      const res = await axiosInstance.post('/lists', {
        nombre: newListName,
        maxWIP: parseInt(maxWIP, 10),
        boardId,
      });
      console.log('Lista agregada:', res.data);
      setLists([...lists, res.data]);
      setNewListName('');
      setMaxWIP('');
    } catch (error) {
      console.error('Error al agregar la lista:', error);
    }
  };

  // Eliminar una lista
  const handleDeleteList = async (listId) => {
    try {
      await axiosInstance.delete(`/lists/${listId}`);
      setLists(lists.filter((list) => list.id !== listId));
    } catch (error) {
      console.error('Error al eliminar la lista:', error);
    }
  };

  // Confirmar el cambio del nombre de una lista
  const handleListNameChange = async () => {
    try {
      await axiosInstance.put(`/lists/${editingListId}`, { nombre: editedListName });
      setLists(lists.map((list) => (list.id === editingListId ? { ...list, nombre: editedListName } : list)));
      setEditingListId(null);
      setEditedListName('');
    } catch (error) {
      console.error('Error al cambiar el nombre de la lista:', error);
    }
  };

  // Manejar la eliminación de una tarjeta
  const handleDeleteCard = async () => {
    if (!cardToDelete) return;

    try {
      await axiosInstance.delete(`/cards/${cardToDelete.id}`);
      setLists(lists.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => card.id !== cardToDelete.id),
      })));
      setShowDeleteCardDialog(false);
      setCardToDelete(null);
    } catch (error) {
      console.error('Error al eliminar la tarjeta:', error);
    }
  };

  const handleOpenCardForm = (listId) => {
    setShowCardFormForList(listId);
    setDialogOpen(true); // Abrir el diálogo cuando se hace clic en "Agregar Tarjeta"
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
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
      <Typography variant="h4" mb={4}>Tablero: {boardId}</Typography>

      {/* Filtros para tareas */}
      <Box display="flex" mb={2}>
        <FormControl sx={{ mr: 2, width: '150px' }} margin="normal">
          <InputLabel>Filtrar por usuario</InputLabel>
          <Select
            value={usuarioFiltro}
            onChange={(e) => setUsuarioFiltro(e.target.value)}
            label="Filtrar por usuario"
          >
            <MenuItem value="">
              <em>Ninguno</em>
            </MenuItem>
            {usuarios.map((usuario) => (
              <MenuItem key={usuario.id} value={usuario.id}>
                {usuario.nombre} ({usuario.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ mr: 2, width: '150px' }} margin="normal">
          <InputLabel>Filtrar por etiqueta</InputLabel>
          <Select
            value={etiquetaFiltro}
            onChange={(e) => setEtiquetaFiltro(e.target.value)}
            label="Filtrar por etiqueta"
          >
            <MenuItem value="">
              <em>Ninguna</em>
            </MenuItem>
            {etiquetas.map((etiqueta, index) => (
              <MenuItem key={index} value={etiqueta}>
                {etiqueta}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Formulario para agregar nueva lista */}
      <Box display="flex" mb={2}>
        <TextField
          label="Nombre de la Lista"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          margin="normal"
          sx={{ mr: 1, width: '150px' }}
        />
        <TextField
          label="Max WIP"
          type="number"
          value={maxWIP}
          onChange={(e) => setMaxWIP(e.target.value)}
          margin="normal"
          sx={{ mr: 1, width: '100px' }}
        />
        <Button variant="contained" color="primary" onClick={handleAddList} sx={{ height: '56px' }}>
          Agregar Lista
        </Button>
      </Box>

      {/* Mostrar listas y tarjetas en formato tipo Kanban */}
      <Grid container spacing={2}>
        {lists.map((list) => (
          <Grid item key={list.id} xs={12} sm={6} md={4} lg={3}>
            <Box p={2} border={1} borderRadius={2} borderColor="grey.300" bgcolor="white">
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                {editingListId === list.id ? (
                  <>
                    <TextField
                      value={editedListName}
                      onChange={(e) => setEditedListName(e.target.value)}
                      margin="normal"
                      sx={{ mr: 1, width: '150px' }}
                    />
                    <IconButton color="primary" onClick={handleListNameChange}>
                      <CheckIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => setEditingListId(null)}>
                      <CloseIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography variant="h6" noWrap>{list.nombre}</Typography>
                    <Box>
                      <IconButton color="primary" onClick={() => { setEditingListId(list.id); setEditedListName(list.nombre); }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteList(list.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Límite máximo de tareas: {list.maxwip}
              </Typography>
              <Box mt={2}>
                {filtrarTarjetas(list.cards ?? []).map((card) => (
                  <Box
                    key={card.id}
                    mb={1}
                    p={2}
                    border={1}
                    borderRadius={2}
                    borderColor="grey.300"
                    bgcolor={card.atrasada ? "rgba(255, 100, 100, 0.3)" : "rgba(255, 235, 59, 0.3)"} // Fondo rojo claro si está atrasada
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body1" noWrap>{card.nombre}</Typography>
                        <Typography variant="body2" noWrap>{card.descripcion}</Typography>
                        {card.etiqueta && <Typography variant="body2">Etiqueta: {card.etiqueta}</Typography>}
                        {card.atrasada && (
                          <Typography variant="body2" color="error">
                            ¡Atrasada!
                          </Typography>
                        )}
                      </Box>
                      <IconButton color="error" onClick={() => { setShowDeleteCardDialog(true); setCardToDelete(card); }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenCardForm(list.id)}
                sx={{ mt: 2 }}
              >
                Agregar Tarjeta
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo emergente para agregar tarjetas */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Agregar Tarjeta</DialogTitle>
        <DialogContent>
          {showCardFormForList && (
            <CardForm listId={showCardFormForList} onCardAdded={handleCardAdded} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para confirmar eliminación de tarjeta */}
      <Dialog open={showDeleteCardDialog} onClose={() => setShowDeleteCardDialog(false)}>
        <DialogTitle>Eliminar Tarjeta</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar esta tarjeta?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteCardDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteCard} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BoardPage;

















