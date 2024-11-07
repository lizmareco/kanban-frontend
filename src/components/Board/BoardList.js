import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';

const BoardList = ({ workspaceId }) => {
  const [boards, setBoards] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        if (!workspaceId) {
          console.error('Workspace ID no proporcionado');
          return;
        }
        const res = await axiosInstance.get(`/boards?workspaceId=${workspaceId}`);
        setBoards(res.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          toast.error('No autorizado. Por favor, inicia sesión nuevamente.');
          router.push('/login'); // Redirigir a la página de inicio de sesión si no está autorizado
        } else {
          console.error('Error al obtener los tableros:', error);
        }
      }
    };

    if (workspaceId) {
      fetchBoards();
    }
  }, [workspaceId, router]);

  
  

  return (
    <div>
      <Button 
  variant="outlined" 
  color="primary" 
  onClick={() => router.push('/workspaces')}
  sx={{ mt: 3 }}
>
  Volver a los espacios de trabajo
</Button>
      <h2>Tableros</h2>
      <ul>
        {boards.map((board) => (
          <li key={board.id}>
            <Link href={`/workspaces/${workspaceId}/boards/${board.id}`}>
              {board.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BoardList;





