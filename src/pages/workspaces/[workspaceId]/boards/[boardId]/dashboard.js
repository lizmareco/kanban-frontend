// pages/workspaces/[workspaceId]/boards/[boardId]/dashboard.js
import { useRouter } from 'next/router';
import StatsChart from '../../../../../components/Dashboard/StatsChart';

const DashboardPage = () => {
  const router = useRouter();
  const { boardId } = router.query;

  return (
    <div>
      <h1>Dashboard de Estadísticas</h1>
      <StatsChart boardId={boardId} />
    </div>
  );
};

export default DashboardPage;
