import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AuthorStat } from '../../types/releaseStats';

interface AuthorStatsChartProps {
  authorStats: AuthorStat[];
  metric: 'commits' | 'additions' | 'deletions' | 'filesChanged';
  height?: number;
  width?: number;
  maxAuthors?: number;
}

const AuthorStatsChart: React.FC<AuthorStatsChartProps> = ({
  authorStats,
  metric,
  height = 300,
  maxAuthors = 10
}) => {
  // Limit the number of authors to display
  const displayedAuthors = authorStats.slice(0, maxAuthors);

  // Prepare data for the chart
  const chartData = displayedAuthors.map(author => ({
    name: author.author,
    value: author[metric]
  }));

  // Sort data by value (descending)
  chartData.sort((a, b) => b.value - a.value);

  // Get metric label
  const getMetricLabel = (): string => {
    switch (metric) {
      case 'commits': return '커밋 수';
      case 'additions': return '추가된 라인 수';
      case 'deletions': return '삭제된 라인 수';
      case 'filesChanged': return '변경된 파일 수';
      default: return '';
    }
  };

  // Get bar color based on metric
  const getBarColor = (): string => {
    switch (metric) {
      case 'commits': return '#6366F1'; // Indigo
      case 'additions': return '#10B981'; // Green
      case 'deletions': return '#EF4444'; // Red
      case 'filesChanged': return '#3B82F6'; // Blue
      default: return '#6366F1';
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white shadow-md p-2 text-sm border border-gray-200">
          <p className="font-medium">{data.name}</p>
          <p>
            {getMetricLabel()}: {data.value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (authorStats.length === 0) {
    return <div className="text-center text-gray-500 p-4">No author data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
      >
        <XAxis type="number" />
        <YAxis 
          type="category" 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          width={100}
          tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" name={getMetricLabel()}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor()} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AuthorStatsChart;
