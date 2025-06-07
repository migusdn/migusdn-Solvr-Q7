import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TopRepository } from '../../types/dashboard';

/**
 * TopRepositoriesChart component props
 */
interface TopRepositoriesChartProps {
  data: TopRepository[];
}

/**
 * Custom tooltip component for the chart
 */
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
        <p className="font-medium text-gray-700">{`저장소: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

/**
 * TopRepositoriesChart component
 */
const TopRepositoriesChart: React.FC<TopRepositoriesChartProps> = ({ data }) => {
  // Sort data by release count in descending order
  const sortedData = [...data].sort((a, b) => b.releaseCount - a.releaseCount);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fontSize: 12 }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="releaseCount" 
            name="릴리스 수" 
            fill="#8884d8" 
            barSize={20}
          />
          <Bar 
            dataKey="commitCount" 
            name="커밋 수" 
            fill="#82ca9d" 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopRepositoriesChart;