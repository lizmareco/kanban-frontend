// src/pages/workspaces/[workspaceId]/boards/[boardId]/index.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '/src/utils/axiosInstance';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Menu,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CardForm from '/src/components/Board/CardForm'; 

const BoardPage = () => {
  const router = useRouter();
  const { workspaceId, boardId } = router.query;

  // Estados principales
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  // Estados para gestión de tareas
  const [tasks, setTasks] = useState({}); // Almacena tareas por cardId
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [currentCardId, setCurrentCardId] = useState(null);
  const [newTask, setNewTask] = useState({
    nombre: '',
    descripcion: '',
    estado: 'open',
    fecha_vencimiento: '',
  });

  // Función para cargar tareas de una tarjeta específica
  const loadTasks = async (cardId) => {
    try {
      const res = await axiosInstance.get(`/cards/${cardId}/tasks`);
      setTasks((prev) => ({ ...prev, [cardId]: res.data }));
    } catch (error) {
      console.error('Error al cargar las tareas:', error);
    }
  };

  

  // Función para manejar la adición de una nueva lista
  const handleAddList = async () => {
    if (!newListName || !maxWIP) {
      alert('Por favor, completa el nombre de la lista y el máximo WIP.');
      return;
    }
    try {
      const res = await axiosInstance.post('/lists', {
        nombre: newListName,
        maxWIP: parseInt(maxWIP, 10),
        boardId,
      });
      // Aseguramos que la nueva lista tenga una propiedad 'cards' como arreglo vacío
      const newList = { ...res.data, cards: [] };
      setLists([...lists, newList]);
      setNewListName('');
      setMaxWIP('');
    } catch (error) {
      console.error('Error al agregar la lista:', error);
    }
  };

  // Función para eliminar una lista
  const handleDeleteList = async (listId) => {
    try {
      await axiosInstance.delete(`/lists/${listId}`);
      setLists(lists.filter((list) => list.id !== listId));
    } catch (error) {
      console.error('Error al eliminar la lista:', error);
    }
  };

  // Función para cambiar el nombre de una lista
  const handleListNameChange = async () => {
    try {
      await axiosInstance.put(`/lists/${editingListId}`, { nombre: editedListName });
      setLists(
        lists.map((list) =>
          list.id === editingListId ? { ...list, nombre: editedListName } : list
        )
      );
      setEditingListId(null);
      setEditedListName('');
    } catch (error) {
      console.error('Error al cambiar el nombre de la lista:', error);
    }
  };

// Función para recalcular usuarios y etiquetas a partir de 'lists'
const recalcularUsuariosYEtiquetas = () => {
  const usuariosSet = new Set();
  const etiquetasSet = new Set();

  lists.forEach((list) => {
    list.cards.forEach((card) => {
      if (card.usuario_nombre) {
        usuariosSet.add(card.usuario_nombre);
      }
      if (card.etiqueta) {
        etiquetasSet.add(card.etiqueta);
      }
    });
  });

  setUsuarios(Array.from(usuariosSet).map((nombre) => ({ nombre })));
  setEtiquetas([...etiquetasSet]);
};

// useEffect que observa cambios en 'lists'
useEffect(() => {
  recalcularUsuariosYEtiquetas();
}, [lists]);

// En handleDeleteCard y handleCardAdded ya no hace falta llamar a recalcularUsuariosYEtiquetas(), 
// pues el useEffect anterior se encargará de hacerlo cuando 'lists' cambie.


  // Función para eliminar una tarjeta
  const handleDeleteCard = async () => {
    if (!cardToDelete) return;
  
    try {
      await axiosInstance.delete(`/cards/${cardToDelete.id}`);
      setLists(
        lists.map((list) => ({
          ...list,
          cards: list.cards.filter((card) => card.id !== cardToDelete.id),
        }))
      );
      // Eliminar las tareas asociadas a la tarjeta eliminada
      setTasks((prev) => {
        const updatedTasks = { ...prev };
        delete updatedTasks[cardToDelete.id];
        return updatedTasks;
      });
      setShowDeleteCardDialog(false);
      setCardToDelete(null);
    } catch (error) {
      console.error('Error al eliminar la tarjeta:', error);
      alert('Hubo un error al eliminar la tarjeta. Por favor, intenta nuevamente.');
    }
  };

  // Función para abrir el formulario de agregar tarjeta
  const handleOpenCardForm = (listId) => {
    setShowCardFormForList(listId);
    setDialogOpen(true);
  };

  // Función para cerrar el diálogo de agregar tarjeta
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Función para manejar el drag and drop de tarjetas
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceList = lists.find((list) => list.id === parseInt(source.droppableId));
    const destinationList = lists.find(
      (list) => list.id === parseInt(destination.droppableId)
    );
    const draggedCard = sourceList.cards.find(
      (card) => card.id === parseInt(draggableId)
    );

    // Remover de la lista de origen
    sourceList.cards.splice(source.index, 1);
    // Insertar en la lista de destino
    destinationList.cards.splice(destination.index, 0, draggedCard);

    setLists([...lists]);

    try {
      await axiosInstance.put(`/cards/${draggableId}/move`, {
        listId: destinationList.id,
        position: destination.index,
      });
    } catch (error) {
      console.error('Error al mover la tarjeta:', error);
      alert('Hubo un error al mover la tarjeta. Por favor, intenta nuevamente.');
    }
  };

  // Función para abrir el menú de opciones de una tarjeta
  const handleMenuClick = (event, card) => {
    setAnchorEl(event.currentTarget);
    setSelectedCard(card);
  };

  // Función para cerrar el menú de opciones
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCard(null);
  };

  // Funciones para manejar la adición de tareas
  const handleOpenTaskDialog = (cardId) => {
    setCurrentCardId(cardId);
    setTaskDialogOpen(true);
  };

  const handleCloseTaskDialog = () => {
    setTaskDialogOpen(false);
    setNewTask({
      nombre: '',
      descripcion: '',
      estado: 'open',
      fecha_vencimiento: '',
    });
    setCurrentCardId(null);
  };

  const handleTaskSubmit = async () => {
    if (!newTask.nombre || !newTask.descripcion || !newTask.fecha_vencimiento) {
      alert('Por favor, completa todos los campos de la tarea.');
      return;
    }

    try {
      const res = await axiosInstance.post(`/cards/${currentCardId}/tasks`, {
        nombre: newTask.nombre,
        descripcion: newTask.descripcion,
        estado: 'open', // Estado por defecto "open"
        fecha_vencimiento: newTask.fecha_vencimiento,
      });
      if (res.status === 200 || res.status === 201) {
        // Actualizar el estado local sin recargar todas las listas
        setTasks((prev) => ({
          ...prev,
          [currentCardId]: prev[currentCardId] ? [...prev[currentCardId], res.data] : [res.data],
        }));
        handleCloseTaskDialog();
      }
    } catch (error) {
      console.error('Error al agregar la tarea:', error);
      alert('Hubo un error al agregar la tarea. Por favor, intenta nuevamente.');
    }
  };

  // Función para eliminar una tarea
  const handleDeleteTask = async (taskId) => {
    try {
      await axiosInstance.delete(`/cards/tasks/${taskId}`);
      setTasks((prev) => {
        const updatedTasks = { ...prev };
        for (const cardId in updatedTasks) {
          updatedTasks[cardId] = updatedTasks[cardId].filter((task) => task.id !== taskId);
        }
        return updatedTasks;
      });
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      alert('Hubo un error al eliminar la tarea. Por favor, intenta nuevamente.');
    }
  };

  // Función para manejar el cambio de estado de una tarea (checkbox)
  const handleToggleTaskStatus = async (task, cardId, isChecked) => {
    const newEstado = isChecked ? 'closed' : 'open';

    try {
      const res = await axiosInstance.put(`/cards/tasks/${task.id}`, {
        estado: newEstado,
      });

      console.log('Respuesta del backend al actualizar estado de tarea:', res.data);

      setTasks((prev) => ({
        ...prev,
        [cardId]: (prev[cardId] || []).map((t) =>
          t.id === task.id ? res.data : t
        ),
      }));
    } catch (error) {
      console.error('Error al actualizar el estado de la tarea:', error);
      alert('Hubo un error al actualizar el estado de la tarea. Por favor, intenta nuevamente.');
    }
  };

  // Función para filtrar tarjetas según los filtros aplicados
  const filtrarTarjetas = (cards = []) => {
    return cards.filter((card) => {
      const coincideUsuario =
        !usuarioFiltro || card.usuario_nombre === usuarioFiltro;
      
      const coincideEtiqueta =
        !etiquetaFiltro ||
        (card.etiqueta && card.etiqueta.trim().toLowerCase() === etiquetaFiltro.trim().toLowerCase());
      
      return coincideUsuario && coincideEtiqueta;
    });
  };
  
  

  // Función para manejar la recarga de listas después de agregar una tarjeta
  const handleCardAdded = async () => {
    try {
      const res = await axiosInstance.get(`/lists/board/${boardId}`);
      // Normalizar los datos para asegurarse de que cada lista tenga 'cards' como arreglo
      const normalizedLists = res.data.map((list) => ({
        ...list,
        cards: Array.isArray(list.cards) ? list.cards : [],
      }));
      setLists(normalizedLists);

      // Cargar tareas para las nuevas tarjetas
      normalizedLists.forEach((list) => {
        list.cards.forEach((card) => {
          if (card.etiqueta) {
            // etiquetasSet ya está actualizado en useEffect
          }
          loadTasks(card.id);
        });
      });

      setDialogOpen(false);
    } catch (error) {
      console.error('Error al recargar las listas:', error);
    }
  };

  // Función para verificar si una tarjeta está atrasada
const isCardAtrasada = (card) => {
  if (!card.fecha_vencimiento) return false; // Si no hay fecha de vencimiento, no está atrasada
  const hoy = new Date();
  const fechaVencimiento = new Date(card.fecha_vencimiento);
  return fechaVencimiento < hoy && card.estado !== 'closed'; 
};
useEffect(() => {
  recalcularUsuariosYEtiquetas();
}, [lists]);
useEffect(() => {
  if (workspaceId && boardId) {
    const fetchData = async () => {
      try {
        // Obtener las listas y tarjetas del tablero
        const res = await axiosInstance.get(`/lists/board/${boardId}`);
        const normalizedLists = res.data.map((list) => ({
          ...list,
          cards: Array.isArray(list.cards) ? list.cards : [],
        }));
        setLists(normalizedLists);

        // Construir un conjunto con los nombres de usuarios asignados a las tarjetas
        const usuariosSet = new Set();
        const etiquetasSet = new Set();

        await Promise.all(
          normalizedLists.map(async (list) => {
            list.cards.forEach((card) => {
              if (card.usuario_nombre) {
                usuariosSet.add(card.usuario_nombre);
              }
              if (card.etiqueta) {
                etiquetasSet.add(card.etiqueta);
              }
              loadTasks(card.id);
            });
          })
        );

        // Convertir Set en array
        setUsuarios(Array.from(usuariosSet).map((nombre) => ({ nombre })));
        setEtiquetas([...etiquetasSet]);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert('Sesión expirada, por favor inicia sesión nuevamente.');
          router.push('/login');
        } else {
          console.error('Error al cargar los datos:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }
}, [workspaceId, boardId]);


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
              label="Filtrar por usuario"
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
              label="Filtrar por etiqueta"
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
              <Box
                p={2}
                border={1}
                borderRadius={2}
                borderColor="grey.300"
                bgcolor={list.cards.length >= list.maxwip ? "rgba(255, 99, 71, 0.3)" : "white"} // Alerta WIP con fondo rojo claro si excede maxWIP
              >
                {list.cards.length >= list.maxwip && (
                  <Alert severity="warning">¡Límite máximo de tareas alcanzado!</Alert>
                )}
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
                              bgcolor={isCardAtrasada(card) ? "rgba(255, 99, 71, 0.3)" : "rgba(255, 235, 59, 0.3)"} // Alerta de tarea atrasada
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                  {/* Nombre */}
                                  <Typography variant="subtitle2" color="text.secondary">Nombre:</Typography>
                                  <Typography variant="body1" noWrap>{card.nombre}</Typography>

                                  {/* Descripción */}
                                  <Typography variant="subtitle2" color="text.secondary">Descripción:</Typography>
                                  <Typography variant="body2" noWrap>{card.descripcion}</Typography>

                                  {/* Fecha de Creación */}
                                  {card.fecha_creacion && (
                                  <>
                                  <Typography variant="subtitle2" color="text.secondary">Fecha de Creación:</Typography>
                                  <Typography variant="body2">
                                  {new Date(card.fecha_creacion).toLocaleDateString()}
                                  </Typography>
                                  </>
                                  )}

                                  {/* Fecha de Vencimiento */}
                                  {card.fecha_vencimiento && (
                                  <>
                                  <Typography variant="subtitle2" color="text.secondary">Fecha de Vencimiento:</Typography>
                                  <Typography variant="body2">
                                    {new Date(card.fecha_vencimiento).toLocaleDateString()}
                                  </Typography>
                                  </>
                                  )}

                                  {/* Usuario asignado */}
                                  {card.usuario_nombre && (
                                  <>
                                      <Typography variant="subtitle2" color="text.secondary">Asignado a:</Typography>
                                      <Typography variant="body2">{card.usuario_nombre}</Typography>
                                  </>
                                  )}

                                {/* Etiqueta */}
                                {card.etiqueta && (
                                <>
                                  <Typography variant="subtitle2" color="text.secondary">Etiqueta:</Typography>
                                  <Typography variant="body2">{card.etiqueta}</Typography>
                                </>
                                )}
                   
                                  {/* Atrasada */}
                                  {isCardAtrasada(card) && (
                                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                  ¡Atrasada!
                                  </Typography>
                                    )}
                                </Box>
                                <Box>
                                  <IconButton
                                    color="primary"
                                    onClick={(e) => handleMenuClick(e, card)}
                                  >
                                    <MoreVertIcon />
                                  </IconButton>
                                  <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl) && selectedCard?.id === card.id}
                                    onClose={handleMenuClose}
                                  >
                                    <MenuItem onClick={() => { handleOpenTaskDialog(card.id); handleMenuClose(); }}>
                                      Agregar Tarea
                                    </MenuItem>
                                    <MenuItem onClick={() => { setShowDeleteCardDialog(true); setCardToDelete(card); handleMenuClose(); }}>
                                      Eliminar Tarjeta
                                    </MenuItem>
                                  </Menu>
                                </Box>
                              </Box>

                              {/* Lista de Tareas como Checklists */}
                              <Box mt={2}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Tareas:
                                </Typography>
                                {tasks[card.id] && tasks[card.id].length > 0 ? (
                                  <Box>
                                    {tasks[card.id].map((task) => (
                                      <Box
                                        key={task.id}
                                        display="flex"
                                        alignItems="center"
                                        mb={1}
                                        p={1}
                                        border={1}
                                        borderRadius={1}
                                        borderColor="grey.200"
                                      >
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              checked={task.estado === 'closed'}
                                              onChange={(e) => handleToggleTaskStatus(task, card.id, e.target.checked)}
                                              color="primary"
                                            />
                                          }
                                          label={
                                            <Box>
                                              <Typography variant="body2" sx={{ textDecoration: task.estado === 'closed' ? 'line-through' : 'none' }}>
                                                {task.nombre}
                                              </Typography>
                                              <Typography variant="caption" color="text.secondary">
                                                {task.descripcion}
                                              </Typography>
                                              <Typography variant="caption" color="text.secondary">
                                                Vencimiento: {new Date(task.fecha_vencimiento).toLocaleDateString()}
                                              </Typography>
                                            </Box>
                                          }
                                        />
                                        {/* Botón para eliminar la tarea */}
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => handleDeleteTask(task.id)}
                                          sx={{ ml: 'auto' }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    ))}
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No hay tareas.
                                  </Typography>
                                )}
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

        {/* Diálogo para agregar una nueva tarea */}
        <Dialog open={taskDialogOpen} onClose={handleCloseTaskDialog}>
          <DialogTitle>Agregar Tarea</DialogTitle>
          <DialogContent>
            <TextField
              label="Nombre de la Tarea"
              value={newTask.nombre}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, nombre: e.target.value }))
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Descripción"
              value={newTask.descripcion}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, descripcion: e.target.value }))
              }
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              label="Fecha de Vencimiento"
              type="date"
              value={newTask.fecha_vencimiento}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, fecha_vencimiento: e.target.value }))
              }
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTaskDialog} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleTaskSubmit} color="primary">
              Agregar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DragDropContext>
  );
};

export default BoardPage;


























