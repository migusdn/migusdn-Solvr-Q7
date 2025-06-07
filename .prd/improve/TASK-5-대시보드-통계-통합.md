# TASK 5: 대시보드 통계 통합

## 5-1. 핵심 기능 목록

- 기존 대시보드에 릴리즈 커밋 통계 섹션 통합
- 요약 통계 화면 개선
- 릴리즈별 커밋 통계 데이터 시각화
- 작성자별 기여도 요약 표시

## 5-2. 프론트엔드 요구사항

### 5-2-1. UI/컴포넌트 구조

- `DashboardPage.tsx` 수정: 릴리즈 커밋 통계 섹션 추가
- `ReleaseStatsCard.tsx`: 릴리즈 통계 요약 카드 컴포넌트 구현
- `ReleaseStatsPanel.tsx`: 대시보드 패널에 통합할 릴리즈 통계 컴포넌트
- `CommitSummaryWidget.tsx`: 릴리즈별 커밋 요약 위젯 구현

### 5-2-2. 상태 관리 및 데이터 통합

- 기존 대시보드 상태에 릴리즈 통계 데이터 통합
- 대시보드 Redux 슬라이스 수정으로 새로운 통계 데이터 관리
- 통계 데이터 로딩 상태 및 오류 처리 관리

### 5-2-3. 통합 레이아웃 설계

- 대시보드 레이아웃에 릴리즈 통계 섹션 배치
- 반응형 그리드 시스템을 활용한 유연한 레이아웃 구성
- 통계 데이터 카드 및 차트 배치 최적화

### 5-2-4. 요약 통계 개선

- 기존 요약 통계에 릴리즈 관련 지표 통합
- 핵심 통계 지표(릴리즈 수, 총 커밋 수, 총 코드 변경량) 추가
- 최근 릴리즈 정보 및 주요 기여자 하이라이트 표시

### 5-2-5. 데이터 연동

- 대시보드 초기 로딩 시 릴리즈 통계 데이터 함께 로드
- 필터링 및 날짜 범위 선택 기능과 통합
- 기존 데이터 소스와 새로운 통계 데이터 동기화

## 5-3. 통합 설계 명세

### 5-3-1. 대시보드 레이아웃 통합

```typescript
// DashboardPage.tsx 수정 사항
const DashboardPage = () => {
  // 기존 상태 코드...
  const [releaseStats, setReleaseStats] = useState<RepositoryReleaseStats | null>(null);

  useEffect(() => {
    // 기존 대시보드 데이터 로딩 코드...

    // 릴리즈 통계 데이터 로딩 추가
    const loadReleaseStats = async () => {
      try {
        const data = await fetchReleaseStats(selectedRepository, startDate, endDate);
        setReleaseStats(data);
      } catch (error) {
        console.error('릴리즈 통계 로딩 실패:', error);
      }
    };

    if (selectedRepository) {
      loadReleaseStats();
    }
  }, [selectedRepository, startDate, endDate]);

  return (
    <div className="dashboard-container">
      {/* 기존 대시보드 헤더 및 필터 컨트롤 */}

      {/* 요약 통계 섹션 */}
      <div className="summary-stats-section">
        <SummaryStatsPanel 
          repositoryData={repositoryData}
          releaseStats={releaseStats} // 릴리즈 통계 전달
        />
      </div>

      {/* 릴리즈 통계 섹션 추가 */}
      <div className="release-stats-section">
        <h2 className="section-title">릴리즈 커밋 통계</h2>
        {releaseStats ? (
          <ReleaseStatsPanel data={releaseStats} />
        ) : (
          <div className="loading-placeholder">릴리즈 통계 로딩 중...</div>
        )}
      </div>

      {/* 기존 차트 및 테이블 섹션 */}
    </div>
  );
};
```

### 5-3-2. 요약 통계 패널 통합

```typescript
// SummaryStatsPanel.tsx 수정 사항
interface SummaryStatsPanelProps {
  repositoryData: RepositoryData | null;
  releaseStats: RepositoryReleaseStats | null; // 추가된 props
}

const SummaryStatsPanel: React.FC<SummaryStatsPanelProps> = ({ 
  repositoryData, 
  releaseStats 
}) => {
  // 릴리즈 관련 통계 계산
  const totalReleases = releaseStats?.releases.length || 0;
  const totalCommits = releaseStats?.releases.reduce(
    (sum, release) => sum + release.compareWithPrevious.totalCommits, 0
  ) || 0;
  const totalAdditions = releaseStats?.releases.reduce(
    (sum, release) => sum + release.compareWithPrevious.totalAdditions, 0
  ) || 0;
  const totalDeletions = releaseStats?.releases.reduce(
    (sum, release) => sum + release.compareWithPrevious.totalDeletions, 0
  ) || 0;

  // 기여자 통계 계산
  const contributorStats = useMemo(() => {
    if (!releaseStats) return [];

    const contributorMap = new Map<string, {
      commits: number;
      additions: number;
      deletions: number;
      filesChanged: number;
    }>();

    releaseStats.releases.forEach(release => {
      release.compareWithPrevious.authorStats.forEach(author => {
        const current = contributorMap.get(author.author) || {
          commits: 0, additions: 0, deletions: 0, filesChanged: 0
        };

        contributorMap.set(author.author, {
          commits: current.commits + author.commits,
          additions: current.additions + author.additions,
          deletions: current.deletions + author.deletions,
          filesChanged: current.filesChanged + author.filesChanged
        });
      });
    });

    return Array.from(contributorMap.entries())
      .map(([author, stats]) => ({ author, ...stats }))
      .sort((a, b) => b.commits - a.commits);
  }, [releaseStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 기존 통계 카드들 */}

      {/* 새로운 릴리즈 통계 카드들 */}
      <StatCard 
        title="총 릴리즈" 
        value={totalReleases.toString()} 
        icon="tag" 
      />
      <StatCard 
        title="총 커밋" 
        value={totalCommits.toString()} 
        icon="git-commit" 
      />
      <StatCard 
        title="추가된 코드" 
        value={`${totalAdditions.toLocaleString()} 줄`} 
        icon="plus-circle" 
        color="green"
      />
      <StatCard 
        title="삭제된 코드" 
        value={`${totalDeletions.toLocaleString()} 줄`} 
        icon="minus-circle" 
        color="red"
      />

      {/* 최근 릴리즈 정보 */}
      {releaseStats?.releases[0] && (
        <div className="col-span-2 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium">최근 릴리즈</h3>
          <div className="mt-2">
            <p><strong>{releaseStats.releases[0].name}</strong> ({releaseStats.releases[0].tagName})</p>
            <p className="text-sm text-gray-500">
              {new Date(releaseStats.releases[0].publishedAt).toLocaleDateString()}
            </p>
            <div className="mt-2 text-sm">
              <p><span className="font-medium">커밋:</span> {releaseStats.releases[0].compareWithPrevious.totalCommits}개</p>
              <p><span className="font-medium">변경:</span> +{releaseStats.releases[0].compareWithPrevious.totalAdditions} / -{releaseStats.releases[0].compareWithPrevious.totalDeletions}</p>
            </div>
          </div>
        </div>
      )}

      {/* 주요 기여자 */}
      <div className="col-span-2 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium">주요 기여자</h3>
        <div className="mt-2">
          {contributorStats.slice(0, 3).map(contributor => (
            <div key={contributor.author} className="flex justify-between items-center mb-2">
              <span>{contributor.author}</span>
              <span className="text-sm">
                {contributor.commits}개 커밋 / +{contributor.additions} / -{contributor.deletions}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 5-3-3. 릴리즈 통계 패널 컴포넌트

```typescript
interface ReleaseStatsPanelProps {
  data: RepositoryReleaseStats;
}

const ReleaseStatsPanel: React.FC<ReleaseStatsPanelProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<'commits' | 'additions' | 'deletions' | 'filesChanged'>('commits');
  const [showAuthors, setShowAuthors] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">릴리즈별 통계</h3>
        <div className="flex space-x-4">
          <select
            className="form-select text-sm"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
          >
            <option value="commits">커밋 수</option>
            <option value="additions">추가된 라인 수</option>
            <option value="deletions">삭제된 라인 수</option>
            <option value="filesChanged">변경된 파일 수</option>
          </select>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              className="form-checkbox mr-2"
              checked={showAuthors}
              onChange={() => setShowAuthors(!showAuthors)}
            />
            작성자별 표시
          </label>
        </div>
      </div>

      <div className="h-96">
        <CommitStatsChart
          releaseStats={data.releaseStats}
          metric={selectedMetric}
          showAuthors={showAuthors}
        />
      </div>

      {showAuthors && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">작성자별 기여도</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64">
              <AuthorContributionChart
                authorStats={getAggregatedAuthorStats(data.releaseStats)}
                metric={selectedMetric}
              />
            </div>
            <div className="overflow-auto max-h-64">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">작성자</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">커밋</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">추가</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">삭제</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getAggregatedAuthorStats(data.releaseStats).map(author => (
                    <tr key={author.author}>
                      <td className="py-2">{author.author}</td>
                      <td className="text-right py-2">{author.commits}</td>
                      <td className="text-right py-2 text-green-600">+{author.additions}</td>
                      <td className="text-right py-2 text-red-600">-{author.deletions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 작성자별 통계 데이터 집계 함수
function getAggregatedAuthorStats(releaseStats: ReleaseComparisonStats[]) {
  const authorMap = new Map<string, AuthorCommitStats>();

  releaseStats.forEach(release => {
    release.authorStats.forEach(author => {
      const current = authorMap.get(author.author) || {
        author: author.author,
        commits: 0,
        additions: 0,
        deletions: 0,
        filesChanged: 0
      };

      authorMap.set(author.author, {
        author: author.author,
        commits: current.commits + author.commits,
        additions: current.additions + author.additions,
        deletions: current.deletions + author.deletions,
        filesChanged: current.filesChanged + author.filesChanged
      });
    });
  });

  return Array.from(authorMap.values())
    .sort((a, b) => b.commits - a.commits);
}
```

## 5-4. 대시보드 통계 통합 로직

1. 기존 대시보드에 릴리즈 통계 데이터 로딩 통합
2. 요약 통계 패널에 릴리즈 관련 지표 추가
3. 릴리즈 통계 시각화 컴포넌트 배치
4. 작성자별 기여도 정보 통합
5. 필터링 및 날짜 범위 컨트롤을 통합 데이터에 적용
