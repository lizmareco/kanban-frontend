// components/Dashboard/StatsChart.js
import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const StatsChart = ({ boardId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await axiosInstance.get(`/dashboard/${boardId}`);
      setData(res.data);
    };

    fetchStats();
  }, [boardId]);

  return (
    <PieChart width={400} height={400}>
      <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
};

export default StatsChart;
