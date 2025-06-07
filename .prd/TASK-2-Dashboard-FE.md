# TASK 2: 대시보드 - 프론트엔드 (FE)

## 2-1. 핵심 기능 목록
- GitHub 릴리스 통계 데이터를 시각화하는 대시보드 UI 구현
- 다양한 차트와 그래프를 활용한 데이터 시각화
- 필터링 및 시간 범위 선택 기능
- 반응형 디자인으로 모바일 및 데스크톱 환경 지원

## 2-2. 프론트엔드 요구사항

### 2-2-1. UI/컴포넌트 구조
- `Dashboard.tsx`: 메인 대시보드 컨테이너 컴포넌트
- `DashboardFilters.tsx`: 날짜 범위, 저장소, 릴리스 타입 등의 필터 컴포넌트
- `TimeSeriesChart.tsx`: 시간별 데이터를 표시하는 차트 컴포넌트
- `SummaryStats.tsx`: 요약 통계를 표시하는 카드 컴포넌트
- `TopRepositoriesChart.tsx`: 상위 저장소를 표시하는 차트 컴포넌트
- `ReleaseTypeBreakdown.tsx`: 릴리스 타입 분포를 표시하는 차트 컴포넌트

### 2-2-2. 상태 관리 및 데이터 바인딩
- Redux Toolkit 슬라이스(`store/dashboard.ts`)를 사용하여 대시보드 상태 관리
- 필터 상태, 로딩 상태, 에러 상태 등 관리
- 필터 변경 시 API 재호출 및 상태 업데이트 로직 구현

### 2-2-3. 상호작용 흐름
- 대시보드 초기 로드 → 기본 필터로 API 호출 → 데이터 표시
- 사용자 필터 변경 → API 재호출 → 차트 및 데이터 업데이트
- 시간 범위 선택 → 시계열 데이터 업데이트
- 데이터 내보내기 → CSV 다운로드 기능 연동

### 2-2-4. 스타일/디자인 가이드라인
- Tailwind CSS를 사용한 반응형 디자인 구현
- 다크 모드/라이트 모드 지원
- Recharts 라이브러리를 활용한 데이터 시각화
- 로딩 상태 및 에러 상태에 대한 UI 처리

### 2-2-5. BE-FE 통신을 위한 데이터 구조 및 통신 방법 명시
- BE API 응답에 맞는 TypeScript 인터페이스 정의
- axios를 사용한 API 요청 및 응답 처리 예시

```typescript
// 대시보드 데이터 타입 정의
interface DashboardData {
  timeSeriesData: {
    date: string;
    releaseCount: number;
    commitCount: number;
    contributorCount: number;
  }[];
  summaryStats: {
    totalReleases: number;
    totalCommits: number;
    totalContributors: number;
    averageCommitsPerRelease: number;
    averageTimeToRelease: number;
  };
  topRepositories: {
    name: string;
    releaseCount: number;
    commitCount: number;
  }[];
  releaseTypeBreakdown: {
    type: string;
    count: number;
    percentage: number;
  }[];
}

// 필터 파라미터 타입 정의
interface DashboardFilterParams {
  timeframe: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
  filters?: {
    repository?: string[];
    releaseType?: string[];
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

// API 호출 예시
const fetchDashboardData = async (params: DashboardFilterParams) => {
  try {
    const response = await axios.get<{
      success: boolean;
      data: DashboardData;
    }>('/api/v1/statistics/dashboard', { params });
    return response.data;
  } catch (error) {
    // 에러 처리
    throw error;
  }
};
```

## 2-3. API 명세

### 2-3-1. 엔드포인트: `GET /api/v1/statistics/dashboard`

### 2-3-2. 요청 파라미터:

```json
{
  "timeframe": "daily|weekly|monthly",
  "startDate": "ISO-8601 date string",
  "endDate": "ISO-8601 date string",
  "filters": {
    "repository": "string[]",
    "releaseType": "string[]"
  },
  "sort": {
    "field": "string",
    "direction": "asc|desc"
  }
}
```

### 2-3-3. 응답 형식:

```json
{
  "success": true,
  "data": {
    "timeSeriesData": [
      {
        "date": "ISO-8601 date string",
        "releaseCount": "number",
        "commitCount": "number",
        "contributorCount": "number"
      }
    ],
    "summaryStats": {
      "totalReleases": "number",
      "totalCommits": "number",
      "totalContributors": "number",
      "averageCommitsPerRelease": "number",
      "averageTimeToRelease": "number"
    },
    "topRepositories": [
      {
        "name": "string",
        "releaseCount": "number",
        "commitCount": "number"
      }
    ],
    "releaseTypeBreakdown": [
      {
        "type": "string",
        "count": "number",
        "percentage": "number"
      }
    ]
  }
}
```

### 2-3-4. 에러 케이스 및 코드

- 400: 잘못된 요청 파라미터
- 401: 인증되지 않은 요청
- 500: 서버 에러
