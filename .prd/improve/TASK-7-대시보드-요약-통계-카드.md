# TASK 7: 대시보드 요약 통계 카드

## 7-1. 핵심 기능 목록

- 릴리즈 커밋 통계 데이터를 시각적으로 표현하는 요약 카드 구현
- 핵심 통계 지표를 직관적으로 표시하는 UI 컴포넌트 개발
- 통계 카드 간 일관된 디자인 시스템 적용
- 데이터 변화 트렌드 시각화

## 7-2. 프론트엔드 요구사항

### 7-2-1. 통계 카드 컴포넌트 설계

- `StatCard.tsx`: 기본 통계 카드 컴포넌트 구현
- `TrendStatCard.tsx`: 트렌드 표시 기능이 있는 통계 카드 구현
- `ContributorStatCard.tsx`: 기여자 통계 표시용 카드 구현
- `ReleaseStatCard.tsx`: 릴리즈 통계 표시용 카드 구현

### 7-2-2. 디자인 및 레이아웃

- 일관된 카드 디자인 및 색상 체계 적용
- 반응형 그리드 레이아웃 지원
- 데이터 로딩 및 오류 상태 처리

### 7-2-3. 데이터 시각화 요소

- 수치 데이터의 크기에 따른 강조 표시
- 증감 지표에 대한 시각적 표현(화살표, 색상 등)
- 미니 차트를 통한 트렌드 시각화

### 7-2-4. 상호작용 기능

- 카드 클릭 시 상세 정보 표시
- 데이터 새로고침 기능
- 툴팁을 통한 추가 정보 제공

## 7-3. 컴포넌트 명세

### 7-3-1. 기본 StatCard 컴포넌트

```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: 'default' | 'primary' | 'green' | 'red' | 'yellow' | 'blue';
  trend?: number; // 증감율(%) -100 ~ +무한대
  footer?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'default',
  trend,
  footer,
  onClick,
  isLoading = false
}) => {
  const colorClasses = {
    default: 'bg-white',
    primary: 'bg-primary-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    yellow: 'bg-yellow-50',
    blue: 'bg-blue-50'
  };

  const iconClasses = {
    default: 'text-gray-500',
    primary: 'text-primary-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    blue: 'text-blue-500'
  };

  return (
    <div 
      className={`${colorClasses[color]} rounded-lg shadow p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            {icon && (
              <div className={`${iconClasses[color]} rounded-full p-1`}>
                <i className={`ri-${icon} text-lg`}></i>
              </div>
            )}
          </div>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold">
              {value}
            </p>
            {trend !== undefined && (
              <span className={`ml-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </div>
          {footer && (
            <p className="mt-1 text-xs text-gray-500">{footer}</p>
          )}
        </>
      )}
    </div>
  );
};
```

### 7-3-2. 트렌드 표시 TrendStatCard 컴포넌트

```typescript
interface TrendStatCardProps extends Omit<StatCardProps, 'trend'> {
  trendData: number[];
  trendLabels?: string[];
  trendColor?: 'green' | 'red' | 'blue' | 'primary';
}

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
```

### 7-3-3. 릴리즈 통계 카드 컴포넌트

```typescript
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
        <div className="text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded-full">
          {repository}
        </div>
      </div>

      <div className="text-sm text-neutral-500 mt-2">
        {new Date(date).toLocaleDateString()}
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
```

### 7-3-4. 기여자 통계 카드 컴포넌트

```typescript
interface ContributorStat {
  author: string;
  commits: number;
  additions: number;
  deletions: number;
  percentage: number;
}

interface ContributorStatCardProps {
  title: string;
  contributors: ContributorStat[];
  metric: 'commits' | 'additions' | 'deletions' | 'changes';
  maxContributors?: number;
  onClick?: () => void;
}

const ContributorStatCard: React.FC<ContributorStatCardProps> = ({
  title,
  contributors,
  metric = 'commits',
  maxContributors = 5,
  onClick
}) => {
  // 선택된 metric으로 정렬
  const sortedContributors = [...contributors]
    .sort((a, b) => {
      switch (metric) {
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
    switch (metric) {
      case 'commits': value = curr.commits; break;
      case 'additions': value = curr.additions; break;
      case 'deletions': value = curr.deletions; break;
      case 'changes': value = curr.additions + curr.deletions; break;
      default: value = curr.commits;
    }
    return Math.max(max, value);
  }, 0);

  return (
    <div 
      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-neutral-900">{title}</h3>
        <select 
          className="text-xs border rounded px-2 py-1"
          value={metric}
          onChange={(e) => {
            // 메트릭 변경 로직 (상위 컴포넌트에서 처리)
          }}
        >
          <option value="commits">커밋 수</option>
          <option value="additions">추가 코드</option>
          <option value="deletions">삭제 코드</option>
          <option value="changes">총 변경</option>
        </select>
      </div>

      <div className="space-y-3">
        {sortedContributors.map(contributor => {
          let value, percentage;
          switch (metric) {
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
                    className={`absolute top-0 left-0 h-full ${metric === 'deletions' ? 'bg-red-500' : 'bg-primary-500'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <div className="ml-2 text-sm w-16 text-right">
                {metric === 'additions' || metric === 'deletions' || metric === 'changes' 
                  ? value.toLocaleString() 
                  : value}
              </div>
            </div>
          );
        })}
      </div>

      {contributors.length > maxContributors && (
        <div className="mt-3 text-center">
          <button 
            className="text-xs text-primary-600 hover:text-primary-800"
            onClick={(e) => {
              e.stopPropagation();
              // 모든 기여자 보기 로직
            }}
          >
            모든 기여자 보기 ({contributors.length}명)
          </button>
        </div>
      )}
    </div>
  );
};
```

## 7-4. 대시보드 통합 방안

1. 요약 대시보드 페이지에 통계 카드 배치
2. 다양한 통계 지표를 시각적으로 표현하는 카드 구성
3. 주요 릴리즈 및 기여자 데이터를 강조하는 카드 배치
4. 반응형 레이아웃으로 모바일 환경 지원
