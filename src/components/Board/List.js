// components/Board/List.js
import { Droppable, Draggable } from 'react-beautiful-dnd';
import Card from './Card';
import CardForm from './CardForm';

const List = ({ list, index }) => {
  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided) => (
        <div
          className="list"
          {...provided.draggableProps}
          ref={provided.innerRef}
          style={{ margin: '0 8px', ...provided.draggableProps.style }}
        >
          <h3 {...provided.dragHandleProps}>{list.nombre}</h3>
          <Droppable droppableId={String(list.id)} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={{
                  backgroundColor: snapshot.isDraggingOver ? 'lightblue' : 'lightgrey',
                  padding: 8,
                  width: 250,
                  minHeight: 500,
                }}
                {...provided.droppableProps}
              >
                {list.cards.map((card, index) => (
                  <Card key={card.id} card={card} index={index} />
                ))}
                {provided.placeholder}
                <CardForm listId={list.id} />
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};

export default List;

