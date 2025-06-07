import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import StatCard from './StatCard';

interface TrendStatCardProps {
  title: string;
  value: string | number;
  trendData: number[];
  trendLabels?: string[];
  trendColor?: 'green' | 'red' | 'blue' | 'primary';
  icon?: string;
  color?: 'default' | 'primary' | 'green' | 'red' | 'yellow' | 'blue';
  onClick?: () => void;
  isLoading?: boolean;
}

/**
 * 트렌드 통계 카드 컴포넌트
 * 시간에 따른 변화 추이를 미니 차트로 표시하는 통계 카드
 */
const TrendStatCard: React.FC<TrendStatCardProps> = ({
  trendData,
  trendLabels,
  trendColor = 'primary',
  ...statCardProps
}) => {
  // 첫 값과 마지막 값의 변화율 계산
  const calculateTrend = () => {
    if (trendData.length < 2) return 0;
    const first = trendData[0];
    const last = trendData[trendData.length - 1];
    return first === 0 ? 0 : Math.round(((last - first) / first) * 100);
  };

  const trend = calculateTrend();

  // Sparkline 미니 차트 데이터 준비
  const chartData = trendData.map((value, index) => ({
    value,
    label: trendLabels?.[index] || `${index + 1}`
  }));

  const strokeColor = {
    green: '#10B981',
    red: '#EF4444',
    blue: '#3B82F6',
    primary: '#6366F1'
  }[trendColor];

  return (
    <StatCard
      {...statCardProps}
      trend={trend}
      footer={
        <div className="h-12 w-full mt-2">
          {/* 미니 스파크라인 차트 구현 */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2}
                dot={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white shadow-md p-2 text-xs">
                        <p>{data.label}: {data.value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      }
    />
  );
};

export default TrendStatCard;