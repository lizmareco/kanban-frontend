// components/Board/Filters.js
import { useState } from 'react';

const Filters = ({ onFilterChange }) => {
  const [assignedUser, setAssignedUser] = useState('');
  const [label, setLabel] = useState('');

  const applyFilters = () => {
    onFilterChange({ assignedUser, label });
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Usuario Asignado"
        value={assignedUser}
        onChange={(e) => setAssignedUser(e.target.value)}
      />
      <input
        type="text"
        placeholder="Etiqueta"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <button onClick={applyFilters}>Aplicar Filtros</button>
    </div>
  );
};

export default Filters;
