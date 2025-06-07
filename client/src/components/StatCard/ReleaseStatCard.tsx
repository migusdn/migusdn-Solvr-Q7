import React from 'react';

interface ReleaseStatCardProps {
  repository: string;
  releaseName: string;
  tagName: string;
  date: string;
  commitCount: number;
  additions: number;
  deletions: number;
  filesChanged: number;
  onClick?: () => void;
}

/**
 * 릴리즈 통계 카드 컴포넌트
 * 릴리즈 정보와 통계를 시각적으로 표현하는 카드
 */
const ReleaseStatCard: React.FC<ReleaseStatCardProps> = ({
  repository,
  releaseName,
  tagName,
  date,
  commitCount,
  additions,
  deletions,
  filesChanged,
  onClick
}) => {
  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-neutral-900">{releaseName}</h3>
          <p className="text-sm text-neutral-500">{tagName}</p>
        </div>
        <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
          {repository}
        </div>
      </div>

      <div className="text-sm text-neutral-500 mt-2">
        {formatDate(date)}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="bg-neutral-50 p-2 rounded">
          <div className="text-xs text-neutral-500">커밋</div>
          <div className="font-medium">{commitCount}</div>
        </div>
        <div className="bg-neutral-50 p-2 rounded">
          <div className="text-xs text-neutral-500">변경 파일</div>
          <div className="font-medium">{filesChanged}</div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm">
        <div>
          <span className="text-green-600">+{additions.toLocaleString()}</span>
          {' / '}
          <span className="text-red-600">-{deletions.toLocaleString()}</span>
        </div>
        <div className="text-xs text-neutral-500">
          총 변경: {(additions + deletions).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ReleaseStatCard;