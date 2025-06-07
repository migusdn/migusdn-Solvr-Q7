# TASK 6: 요약 통계 개선

## 6-1. 핵심 기능 목록

- 기존 요약 통계 데이터에 릴리즈 커밋 통계 통합
- 릴리즈 간 변경사항 요약 통계 추가
- 작성자별 기여도 요약 개선
- 요약 통계 시각적 표현 개선

## 6-2. 백엔드 요구사항

### 6-2-1. 요약 통계 데이터 확장

- 기존 요약 통계 API 응답에 릴리즈 관련 데이터 추가
- 릴리즈별 커밋 통계 요약 정보 계산 및 제공
- 전체 저장소의 작성자별 기여도 집계 로직 추가

### 6-2-2. API 엔드포인트 개선

- 기존 `/api/github/stats/summary` 엔드포인트 수정
- 릴리즈 통계 요약 데이터 포함
- 선택적 매개변수로 상세 정보 수준 조정 기능 제공

### 6-2-3. 데이터 처리 로직 수정

- 릴리즈 간 변경사항을 요약 통계에 반영
- 통계 데이터 캐싱 및 성능 최적화
- 기존 통계와 새로운 통계의 일관성 보장

### 6-2-4. BE-FE 데이터 구조 및 통신 방법 명세

- 확장된 요약 통계 응답 스키마 정의
- 기존 클라이언트와의 호환성 유지

## 6-3. 프론트엔드 요구사항

### 6-3-1. UI 컴포넌트 개선

- 요약 통계 카드 디자인 개선
- 핵심 지표의 시각적 강조 및 트렌드 표시
- 요약 통계 레이아웃 최적화

### 6-3-2. 데이터 표현 방식 개선

- 릴리즈 기반 통계 시각화 요소 추가
- 기여자 통계 시각적 표현 개선
- 주요 지표의 트렌드 그래프 추가

### 6-3-3. 필터링 및 상호작용 기능

- 기간별 요약 통계 필터링
- 주요 지표 클릭 시 상세 정보 표시
- 작성자별 필터링 기능 추가

## 6-4. API 명세

### 6-4-1. 엔드포인트: `GET /api/github/stats/summary`

### 6-4-2. 요청 매개변수:

```json
{
  "repository": "string",       // GitHub 저장소 경로 (예: "owner/repo")
  "startDate": "string",      // 조회 시작 날짜 (선택적, ISO 형식)
  "endDate": "string",        // 조회 종료 날짜 (선택적, ISO 형식)
  "includeReleaseStats": true  // 릴리즈 통계 포함 여부 (선택적, 기본값: true)
}
```

### 6-4-3. 응답 형식:

```json
{
  "repository": "string",
  "period": {
    "startDate": "string",
    "endDate": "string"
  },
  "generalStats": {
    "totalCommits": 0,
    "totalPullRequests": 0,
    "totalIssues": 0,
    "starCount": 0,
    "forkCount": 0,
    "watcherCount": 0
  },
  "releaseStats": {
    "totalReleases": 0,
    "recentReleases": [
      {
        "tagName": "string",
        "name": "string",
        "publishedAt": "string",
        "commitCount": 0,
        "additions": 0,
        "deletions": 0,
        "filesChanged": 0
      }
    ],
    "aggregatedStats": {
      "totalCommits": 0,
      "totalAdditions": 0,
      "totalDeletions": 0,
      "totalFilesChanged": 0
    }
  },
  "contributorStats": {
    "totalContributors": 0,
    "topContributors": [
      {
        "author": "string",
        "commits": 0,
        "additions": 0,
        "deletions": 0,
        "filesChanged": 0,
        "contributionPercentage": 0.0
      }
    ]
  }
}
```

### 6-4-4. 오류 케이스 및 코드

- 400: 잘못된 요청 매개변수 (저장소 경로 누락 등)
- 401: GitHub API 인증 오류
- 404: 저장소를 찾을 수 없음
- 429: GitHub API 요청 제한 초과
- 500: 서버 내부 오류

## 6-5. 프론트엔드 구현 예시

```typescript
// SummaryDashboard.tsx
const SummaryDashboard: React.FC<{ repository: string }> = ({ repository }) => {
  const [summaryData, setSummaryData] = useState<RepositorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        const params: any = { repository };
        if (dateRange) {
          params.startDate = dateRange.start;
          params.endDate = dateRange.end;
        }

        const response = await axios.get('/api/github/stats/summary', { params });
        setSummaryData(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch summary data:', err);
        setError('통계 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (repository) {
      fetchSummaryData();
    }
  }, [repository, dateRange]);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!summaryData) {
    return <EmptyState message="선택된 저장소가 없습니다." />;
  }

  return (
    <div className="summary-dashboard">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">저장소 요약 통계</h2>
        <DateRangePicker onChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 일반 통계 카드 */}
        <StatCard 
          title="총 커밋" 
          value={summaryData.generalStats.totalCommits.toString()} 
          icon="git-commit" 
        />
        <StatCard 
          title="Pull Requests" 
          value={summaryData.generalStats.totalPullRequests.toString()} 
          icon="git-pull-request" 
        />
        <StatCard 
          title="이슈" 
          value={summaryData.generalStats.totalIssues.toString()} 
          icon="issue-opened" 
        />
        <StatCard 
          title="Stars" 
          value={summaryData.generalStats.starCount.toString()} 
          icon="star" 
          color="yellow"
        />

        {/* 릴리즈 통계 카드 */}
        <StatCard 
          title="총 릴리즈" 
          value={summaryData.releaseStats.totalReleases.toString()} 
          icon="tag" 
        />
        <StatCard 
          title="총 추가 코드" 
          value={`${summaryData.releaseStats.aggregatedStats.totalAdditions.toLocaleString()} 줄`} 
          icon="plus-circle" 
          color="green"
        />
        <StatCard 
          title="총 삭제 코드" 
          value={`${summaryData.releaseStats.aggregatedStats.totalDeletions.toLocaleString()} 줄`} 
          icon="minus-circle" 
          color="red"
        />
        <StatCard 
          title="총 기여자" 
          value={summaryData.contributorStats.totalContributors.toString()} 
          icon="users" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 릴리즈 섹션 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">최근 릴리즈</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">릴리즈</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">날짜</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">커밋</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">변경사항</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summaryData.releaseStats.recentReleases.map(release => (
                  <tr key={release.tagName}>
                    <td className="py-2">
                      <div className="font-medium">{release.name}</div>
                      <div className="text-sm text-gray-500">{release.tagName}</div>
                    </td>
                    <td className="py-2">{new Date(release.publishedAt).toLocaleDateString()}</td>
                    <td className="text-right py-2">{release.commitCount}</td>
                    <td className="text-right py-2">
                      <span className="text-green-600">+{release.additions.toLocaleString()}</span>
                      {' / '}
                      <span className="text-red-600">-{release.deletions.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 기여자 통계 섹션 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">주요 기여자</h3>
          <div className="grid grid-cols-1 gap-4">
            {summaryData.contributorStats.topContributors.map(contributor => (
              <div key={contributor.author} className="flex items-center">
                <div className="w-1/4 truncate">{contributor.author}</div>
                <div className="w-3/4">
                  <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary-500"
                      style={{ width: `${contributor.contributionPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>{contributor.commits}개 커밋</span>
                    <span>{contributor.contributionPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```
