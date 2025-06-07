import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ReleaseTypeBreakdown as ReleaseTypeBreakdownType } from '../../types/dashboard';

/**
 * ReleaseTypeBreakdown component props
 */
interface ReleaseTypeBreakdownProps {
  data: ReleaseTypeBreakdownType[];
}

/**
 * Custom tooltip component for the chart
 */
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
        <p className="font-medium text-gray-700">{`타입: ${data.type === 'regular' ? '정식 릴리스' : '프리릴리스'}`}</p>
        <p style={{ color: payload[0].color }}>{`개수: ${data.count}`}</p>
        <p style={{ color: payload[0].color }}>{`비율: ${data.percentage.toFixed(1)}%`}</p>
      </div>
    );
  }

  return null;
};

/**
 * ReleaseTypeBreakdown component
 */
const ReleaseTypeBreakdown: React.FC<ReleaseTypeBreakdownProps> = ({ data }) => {
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Format the data for better display
  const formattedData = data.map(item => ({
    ...item,
    name: item.type === 'regular' ? '정식 릴리스' : '프리릴리스'
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReleaseTypeBreakdown;