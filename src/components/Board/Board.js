// components/Board/Board.js
import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import List from './List';

const Board = ({ boardId }) => {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const res = await axiosInstance.get(`/boards/${boardId}/lists`);
        setLists(res.data);
      } catch (error) {
        console.error('Error fetching lists:', error);
      }
    };

    fetchLists();
  }, [boardId]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId, type } = result;

    // Si no hay destino (se soltó fuera de una droppable) o el destino es el mismo que el origen, no hacemos nada
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }

    try {
      if (type === 'card') {
        // Moviendo una tarjeta
        const sourceListIndex = lists.findIndex((list) => list.id === parseInt(source.droppableId));
        const destinationListIndex = lists.findIndex((list) => list.id === parseInt(destination.droppableId));

        const sourceList = lists[sourceListIndex];
        const destinationList = lists[destinationListIndex];

        // Copiamos las tarjetas de origen y destino
        const sourceCards = Array.from(sourceList.cards);
        const destinationCards = Array.from(destinationList.cards);

        // Removemos la tarjeta de la lista de origen
        const [movedCard] = sourceCards.splice(source.index, 1);

        // Insertamos la tarjeta en la posición correcta en la lista de destino
        destinationCards.splice(destination.index, 0, movedCard);

        // Actualizamos las listas con las nuevas tarjetas
        const newLists = Array.from(lists);
        newLists[sourceListIndex] = { ...sourceList, cards: sourceCards };
        newLists[destinationListIndex] = { ...destinationList, cards: destinationCards };

        setLists(newLists);

        // Actualizamos el back-end
        await axiosInstance.put(`/cards/${draggableId}/move`, {
          listId: destinationList.id,
          position: destination.index,
        });
      } else if (type === 'list') {
        // Moviendo una lista
        const newLists = Array.from(lists);
        const [movedList] = newLists.splice(source.index, 1);
        newLists.splice(destination.index, 0, movedList);

        setLists(newLists);

        // Actualizamos el back-end
        await axiosInstance.put(`/lists/${movedList.id}/move`, {
          position: destination.index,
        });
      }
    } catch (error) {
      console.error('Error moving item:', error);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="board" type="list" direction="horizontal">
        {(provided) => (
          <div
            className="board"
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ display: 'flex', overflowX: 'auto' }}
          >
            {lists.map((list, index) => (
              <List key={list.id} list={list} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Board;


