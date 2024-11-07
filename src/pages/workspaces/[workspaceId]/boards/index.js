// pages/workspaces/[workspaceId]/boards/index.js
import { useRouter } from 'next/router';
import BoardList from '../../../../components/Board/BoardList';
import BoardForm from '../../../../components/Board/BoardForm';

const BoardsPage = () => {
  const router = useRouter();
  const { workspaceId } = router.query;

  return (
    <div>
      <h1>Tableros del Espacio de Trabajo</h1>
      <BoardForm workspaceId={workspaceId} />
      <BoardList workspaceId={workspaceId} />
    </div>
  );
};

export default BoardsPage;
