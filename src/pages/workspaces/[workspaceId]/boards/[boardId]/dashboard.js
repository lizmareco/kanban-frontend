// src/pages/workspaces/[workspaceId]/boards/[boardId]/dashboard.js

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axiosInstance from '/src/utils/axiosInstance';
import { Box, CircularProgress, Typography, Grid, Button } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardPage = () => {
  const router = useRouter();
  const { workspaceId, boardId } = router.query;

  const [loading, setLoading] = useState(true);
  const [cardsData, setCardsData] = useState({
    tasksByStatus: {},
    overdueTasks: 0,
    tasksByUser: {},
  });

  useEffect(() => {
    if (workspaceId && boardId) {
      const fetchData = async () => {
        try {
          // Obtener los datos del dashboard
          const dashboardRes = await axiosInstance.get(`/dashboard/boards/${boardId}`);
          const { tasksByStatus, overdueTasks, tasksByUser } = dashboardRes.data;

          // Filtrar los datos para evitar que se muestren estados vacíos o duplicados
          const filteredTasksByStatus = Object.fromEntries(
            Object.entries(tasksByStatus).filter(([key, value]) => value > 0)
          );

          setCardsData({
            tasksByStatus: filteredTasksByStatus,
            overdueTasks,
            tasksByUser,
          });
        } catch (error) {
          console.error('Error al obtener los datos del dashboard:', error);
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

  // Procesar datos para gráficos
  const { tasksByStatus, overdueTasks, tasksByUser } = cardsData;

  // Crear datos para los gráficos
  const statusChartData = {
    labels: Object.keys(tasksByStatus),
    datasets: [
      {
        label: 'Tareas por Estado',
        data: Object.values(tasksByStatus),
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
      },
    ],
  };

  const userChartData = {
    labels: Object.keys(tasksByUser),
    datasets: [
      {
        label: 'Tareas por Usuario',
        data: Object.values(tasksByUser),
        backgroundColor: '#36a2eb',
      },
    ],
  };

  const overdueChartData = {
    labels: ['Tareas Atrasadas', 'Tareas No Atrasadas'],
    datasets: [
      {
        data: [overdueTasks, Object.values(tasksByStatus).reduce((a, b) => a + b, 0) - overdueTasks],
        backgroundColor: ['#ff6384', '#4bc0c0'],
      },
    ],
  };

  const statusChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  return (
    <Box p={4}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push(`/workspaces/${workspaceId}/boards/${boardId}`)}
        sx={{ position: 'absolute', top: 80, right: 16 }}
      >
        Volver al Tablero
      </Button>
      <Typography variant="h4" mb={4}>Dashboard de Tablero: {boardId}</Typography>

      {/* Contenedor de los gráficos */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="h6" mb={2}>Tareas por Estado</Typography>
            <Bar data={statusChartData} options={statusChartOptions} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="h6" mb={2}>Tareas por Usuario</Typography>
            <Bar data={userChartData} options={statusChartOptions} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="h6" mb={2}>Tareas Atrasadas</Typography>
            <Pie data={overdueChartData} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;