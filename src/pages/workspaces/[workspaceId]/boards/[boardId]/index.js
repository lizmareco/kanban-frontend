import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '/src/utils/axiosInstance';
import { Box, Button, TextField, Typography, IconButton, CircularProgress, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CardForm from '/src/components/Board/CardForm';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const BoardPage = () => {
  const router = useRouter();
  const { workspaceId, boardId } = router.query;

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [maxWIP, setMaxWIP] = useState('');
  const [usuarioFiltro, setUsuarioFiltro] = useState('');
  const [etiquetaFiltro, setEtiquetaFiltro] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editedListName, setEditedListName] = useState('');
  const [showCardFormForList, setShowCardFormForList] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showDeleteCardDialog, setShowDeleteCardDialog] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);

  const handleCardAdded = async () => {
    const res = await axiosInstance.get(`/lists/board/${boardId}`);
    setLists(res.data);
    setDialogOpen(false);
  };

  useEffect(() => {
    if (workspaceId && boardId) {
      const fetchData = async () => {
        try {
          // Obtener las listas y tarjetas del tablero
          const res = await axiosInstance.get(`/lists/board/${boardId}`);
          setLists(res.data);

          // Obtener usuarios del sistema
          const usuariosRes = await axiosInstance.get('/users');
          setUsuarios(usuariosRes.data);

          // Obtener etiquetas de las tarjetas
          const etiquetasSet = new Set();

          res.data.forEach((list) => {
            list.cards.forEach((card) => {
              if (card.etiqueta) {
                etiquetasSet.add(card.etiqueta);
              }
            });
          });

          setEtiquetas([...etiquetasSet]);
        } catch (error) {
          if (error.response && error.response.status === 401) {
            alert('Sesión expirada, por favor inicia sesión nuevamente.');
            router.push('/login');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [workspaceId, boardId]);

  const filtrarTarjetas = (cards = []) => {
    return cards.filter((card) => {
      const coincideUsuario = !usuarioFiltro || card.usuario_asignado === parseInt(usuarioFiltro);
      const coincideEtiqueta = !etiquetaFiltro || (card.etiqueta && card.etiqueta.includes(etiquetaFiltro));
      return coincideUsuario && coincideEtiqueta;
    });
  };

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
      setLists([...lists, res.data]);
      setNewListName('');
      setMaxWIP('');
    } catch (error) {
      console.error('Error al agregar la lista:', error);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      await axiosInstance.delete(`/lists/${listId}`);
      setLists(lists.filter((list) => list.id !== listId));
    } catch (error) {
      console.error('Error al eliminar la lista:', error);
    }
  };

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
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceList = lists.find((list) => list.id === parseInt(source.droppableId));
    const destinationList = lists.find((list) => list.id === parseInt(destination.droppableId));
    const draggedCard = sourceList.cards.find((card) => card.id === parseInt(draggableId));

    sourceList.cards.splice(source.index, 1);
    destinationList.cards.splice(destination.index, 0, draggedCard);

    setLists([...lists]);

    await axiosInstance.put(`/cards/${draggableId}/move`, {
      listId: destinationList.id,
      position: destination.index,
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box p={4}>
        <Typography variant="h4" mb={4}>Tablero: {boardId}</Typography>

        {/* Filtros para tareas */}
        <Box display="flex" mb={2}>
          <FormControl margin="normal" sx={{ mr: 1, width: '150px' }}>
            <InputLabel>Filtrar por usuario</InputLabel>
            <Select
              value={usuarioFiltro}
              onChange={(e) => setUsuarioFiltro(e.target.value)}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {usuarios.map((usuario) => (
                <MenuItem key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl margin="normal" sx={{ mr: 1, width: '150px' }}>
            <InputLabel>Filtrar por etiqueta</InputLabel>
            <Select
              value={etiquetaFiltro}
              onChange={(e) => setEtiquetaFiltro(e.target.value)}
            >
              <MenuItem value="">
                <em>Todas</em>
              </MenuItem>
              {etiquetas.map((etiqueta) => (
                <MenuItem key={etiqueta} value={etiqueta}>
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
                <Droppable droppableId={`${list.id}`}>
                  {(provided) => (
                    <Box ref={provided.innerRef} {...provided.droppableProps} mt={2}>
                      {filtrarTarjetas(list.cards).map((card, index) => (
                        <Draggable key={card.id} draggableId={`${card.id}`} index={index}>
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              mb={1}
                              p={2}
                              border={1}
                              borderRadius={2}
                              borderColor="grey.300"
                              bgcolor="rgba(255, 235, 59, 0.3)"
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                  <Typography variant="body1" noWrap>{card.nombre}</Typography>
                                  <Typography variant="body2" noWrap>{card.descripcion}</Typography>
                                  {card.etiqueta && <Typography variant="body2">Etiqueta: {card.etiqueta}</Typography>}
                                  {card.usuario_nombre && (
                                    <Typography variant="body2">Asignado a: {card.usuario_nombre}</Typography>
                                  )}
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
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
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
    </DragDropContext>
  );
};

export default BoardPage;
























