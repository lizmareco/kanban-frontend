// components/Board/Card.js
import { Draggable } from 'react-beautiful-dnd';

const Card = ({ card, index }) => {
  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {(provided, snapshot) => (
        <div
          className="card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            userSelect: 'none',
            padding: 16,
            margin: '0 0 8px 0',
            backgroundColor: snapshot.isDragging ? '#263B4A' : '#456C86',
            color: 'white',
            ...provided.draggableProps.style,
          }}
        >
          <p>{card.nombre}</p>
          <p>{card.descripcion}</p>
          {/* Mostrar la etiqueta */}
          {card.etiqueta && <p>Etiqueta: {card.etiqueta}</p>}
          {/* Muestra alerta si la tarjeta está atrasada */}
          {card.atrasada && <p style={{ color: 'red' }}>¡Atrasada!</p>}
        </div>
      )}
    </Draggable>
  );
};

export default Card;


