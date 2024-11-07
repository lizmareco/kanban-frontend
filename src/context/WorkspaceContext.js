import { createContext, useContext, useState } from 'react';

// Crear el contexto
const WorkspaceContext = createContext();

// Crear el provider del contexto
export const WorkspaceProvider = ({ children }) => {
  const [workspaceId, setWorkspaceId] = useState(null);

  return (
    <WorkspaceContext.Provider value={{ workspaceId, setWorkspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// Hook personalizado para usar el contexto de workspace
export const useWorkspace = () => {
  return useContext(WorkspaceContext);
};

