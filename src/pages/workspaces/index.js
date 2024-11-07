// pages/workspaces/index.js
import WorkspaceList from '../../components/Workspace/WorkspaceList';
import WorkspaceForm from '../../components/Workspace/WorkspaceForm';

const WorkspacesPage = () => {
  return (
    <div>
      <h1>Espacios de Trabajo</h1>
      <WorkspaceForm />
      <WorkspaceList />
    </div>
  );
};

export default WorkspacesPage;
