import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TimeSeriesDataPoint } from '../../types/dashboard';

/**
 * TimeSeriesChart component props
 */
interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
}

/**
 * Tooltip props interface
 */
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

/**
 * Custom tooltip component for the chart
 */
const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
        <p className="font-medium text-gray-700">{`날짜: ${label}`}</p>
        {payload.map((entry, index) => (
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
 * TimeSeriesChart component
 */
const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data }) => {
  // Format date labels based on data format
  const formatXAxis = (tickItem: string) => {
    if (tickItem.includes('W')) {
      // Weekly format: YYYY-WXX
      const [year, week] = tickItem.split('-W');
      return `${year}년 ${week}주`;
    } else if (tickItem.length === 7) {
      // Monthly format: YYYY-MM
      const [year, month] = tickItem.split('-');
      return `${year}년 ${month}월`;
    } else {
      // Daily format: YYYY-MM-DD
      const date = new Date(tickItem);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12 }}
          />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="releaseCount"
            name="릴리스 수"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="commitCount"
            name="커밋 수"
            stroke="#82ca9d"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="contributorCount"
            name="기여자 수"
            stroke="#ffc658"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeSeriesChart;
