# TASK 4: 릴리즈 통계 시각화 컴포넌트

## 4-1. 핵심 기능 목록

- 릴리즈 커밋 통계 데이터 시각화
- 작성자별 기여도 차트 제공
- 릴리즈 간 비교 시각화
- 필터링 및 정렬 옵션

## 4-2. 프론트엔드 요구사항

### 4-2-1. UI/컴포넌트 구조

- `CommitStatsChart.tsx`: 커밋 통계 차트 컴포넌트
- `AuthorContributionChart.tsx`: 작성자별 기여도 차트 컴포넌트
- `ReleaseComparisonChart.tsx`: 릴리즈 간 비교 차트 컴포넌트
- `StatsFilterControls.tsx`: 통계 필터링 컨트롤 컴포넌트

### 4-2-2. 상태 관리 및 데이터 바인딩

- Recharts 라이브러리를 사용한 데이터 시각화
- Redux 상태에서 데이터 바인딩
- 필터링 및 정렬 상태 관리

### 4-2-3. 상호작용 흐름

- 데이터 로딩 → 차트 표시 → 사용자 필터링/정렬 → 차트 업데이트
- 차트 요소 클릭 시 상세 정보 표시
- 차트 데이터 내보내기 기능 (CSV, PNG)

### 4-2-4. 스타일/디자인 가이드라인

- 차트 색상 테마 및 일관성 있는 디자인
- 반응형 차트 레이아웃
- 데이터 로딩 및 오류 상태 처리

### 4-2-5. 차트 종류 및 데이터 표현

- 바 차트: 릴리즈별 커밋 수, 코드 라인 변경 수 비교
- 파이 차트: 작성자별 기여도 비율
- 라인 차트: 시간에 따른 변화 추이
- 테이블: 상세 데이터 표시 및 정렬

## 4-3. 컴포넌트 세부 명세

### 4-3-1. CommitStatsChart 컴포넌트

- 입력 Props:
```typescript
interface CommitStatsChartProps {
  releaseStats: ReleaseComparisonStats[];
  metric: 'commits' | 'additions' | 'deletions' | 'filesChanged';
  showAuthors: boolean;
  height?: number;
  width?: number;
}
```

- 구현 사항:
  - 선택된 메트릭에 따라 릴리즈별 통계 바 차트 표시
  - showAuthors가 true일 경우 작성자별로 구분된 스택 바 차트 표시
  - 차트 위에 마우스를 올렸을 때 상세 정보 툴팁 표시

### 4-3-2. AuthorContributionChart 컴포넌트

- 입력 Props:
```typescript
interface AuthorContributionChartProps {
  authorStats: AuthorCommitStats[];
  metric: 'commits' | 'additions' | 'deletions' | 'filesChanged';
  height?: number;
  width?: number;
}
```

- 구현 사항:
  - 작성자별 기여도를 파이 차트로 시각화
  - 선택된 메트릭에 따라 데이터 표시
  - 작성자별 색상 구분 및 범례 표시

### 4-3-3. ReleaseComparisonChart 컴포넌트

- 입력 Props:
```typescript
interface ReleaseComparisonChartProps {
  releaseStats: ReleaseComparisonStats[];
  metrics: Array<'commits' | 'additions' | 'deletions' | 'filesChanged'>;
  height?: number;
  width?: number;
}
```

- 구현 사항:
  - 선택된 여러 메트릭을 릴리즈별로 비교하는 복합 차트
  - 다중 Y축을 사용하여 서로 다른 스케일의 메트릭 표시
  - 시간순 또는 릴리즈 순으로 데이터 정렬 옵션

### 4-3-4. StatsFilterControls 컴포넌트

- 입력 Props:
```typescript
interface StatsFilterControlsProps {
  authors: string[];
  onAuthorFilterChange: (selectedAuthors: string[]) => void;
  onMetricChange: (metric: string) => void;
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void;
}
```

- 구현 사항:
  - 작성자 필터링 체크박스 목록
  - 메트릭 선택 드롭다운 (커밋 수, 추가/삭제 라인 수, 파일 수)
  - 정렬 순서 토글 버튼
  - 데이터 내보내기 버튼
