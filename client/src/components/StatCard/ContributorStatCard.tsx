import React, { useState } from 'react';

interface ContributorStat {
  author: string;
  commits: number;
  additions: number;
  deletions: number;
  filesChanged: number;
  percentage: number;
}

interface ContributorStatCardProps {
  title: string;
  contributors: ContributorStat[];
  metric?: 'commits' | 'additions' | 'deletions' | 'changes';
  maxContributors?: number;
  onClick?: () => void;
}

/**
 * 기여자 통계 카드 컴포넌트
 * 작성자별 기여도를 시각적으로 표현하는 카드
 */
const ContributorStatCard: React.FC<ContributorStatCardProps> = ({
  title,
  contributors,
  metric = 'commits',
  maxContributors = 5,
  onClick
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'commits' | 'additions' | 'deletions' | 'changes'>(metric);

  // 선택된 metric으로 정렬
  const sortedContributors = [...contributors]
    .sort((a, b) => {
      switch (selectedMetric) {
        case 'commits': return b.commits - a.commits;
        case 'additions': return b.additions - a.additions;
        case 'deletions': return b.deletions - a.deletions;
        case 'changes': return (b.additions + b.deletions) - (a.additions + a.deletions);
        default: return b.commits - a.commits;
      }
    })
    .slice(0, maxContributors);

  // 최대값 계산 (막대 그래프 상대적 크기 계산용)
  const maxValue = sortedContributors.reduce((max, curr) => {
    let value;
    switch (selectedMetric) {
      case 'commits': value = curr.commits; break;
      case 'additions': value = curr.additions; break;
      case 'deletions': value = curr.deletions; break;
      case 'changes': value = curr.additions + curr.deletions; break;
      default: value = curr.commits;
    }
    return Math.max(max, value);
  }, 0);

  // 메트릭 변경 핸들러
  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMetric(e.target.value as any);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-neutral-900">{title}</h3>
        <select 
          className="text-xs border rounded px-2 py-1"
          value={selectedMetric}
          onChange={handleMetricChange}
        >
          <option value="commits">커밋 수</option>
          <option value="additions">추가 코드</option>
          <option value="deletions">삭제 코드</option>
          <option value="changes">총 변경</option>
        </select>
      </div>

      {contributors.length === 0 ? (
        <div className="text-center text-gray-500 p-4">기여자 데이터가 없습니다</div>
      ) : (
        <div className="space-y-3">
          {sortedContributors.map(contributor => {
            let value, percentage;
            switch (selectedMetric) {
              case 'commits':
                value = contributor.commits;
                percentage = (value / maxValue) * 100;
                break;
              case 'additions':
                value = contributor.additions;
                percentage = (value / maxValue) * 100;
                break;
              case 'deletions':
                value = contributor.deletions;
                percentage = (value / maxValue) * 100;
                break;
              case 'changes':
                value = contributor.additions + contributor.deletions;
                percentage = (value / maxValue) * 100;
                break;
              default:
                value = contributor.commits;
                percentage = (value / maxValue) * 100;
            }

            return (
              <div key={contributor.author} className="flex items-center">
                <div className="w-24 truncate text-sm">{contributor.author}</div>
                <div className="flex-1 ml-2">
                  <div className="relative h-4 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full ${selectedMetric === 'deletions' ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="ml-2 text-sm w-16 text-right">
                  {selectedMetric === 'additions' || selectedMetric === 'deletions' || selectedMetric === 'changes' 
                    ? value.toLocaleString() 
                    : value}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {contributors.length > maxContributors && (
        <div className="mt-3 text-center">
          <button 
            className="text-xs text-blue-600 hover:text-blue-800"
            onClick={(e) => {
              e.stopPropagation();
              // 모든 기여자 보기 로직 (실제 구현 시 추가)
            }}
          >
            모든 기여자 보기 ({contributors.length}명)
          </button>
        </div>
      )}
    </div>
  );
};

export default ContributorStatCard;