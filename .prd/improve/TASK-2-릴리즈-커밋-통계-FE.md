# TASK 2: 릴리즈 커밋 통계 - 프론트엔드(FE)

## 2-1. 핵심 기능 목록

- 릴리즈 커밋 통계 데이터 조회 및 표시
- 작성자별 통계 시각화
- 릴리즈 간 비교 차트 제공
- 필터링 및 정렬 기능

## 2-2. 프론트엔드 요구사항

### 2-2-1. UI/컴포넌트 구조

- `ReleaseCommitStats.tsx`: 릴리즈 커밋 통계 표시 컴포넌트
- `AuthorStatsChart.tsx`: 작성자별 통계 시각화 차트 컴포넌트
- `ReleaseComparisonTable.tsx`: 릴리즈 간 비교 테이블 컴포넌트

### 2-2-2. 상태 관리 및 데이터 바인딩

- Redux Toolkit을 사용한 `releaseStatsSlice.ts` 구현
- 통계 데이터 로딩, 저장, 필터링 상태 관리

### 2-2-3. 상호작용 흐름

- 저장소 선택 → 날짜 범위 선택(선택적) → API 호출 → 데이터 시각화
- 릴리즈 선택 시 해당 릴리즈의 상세 통계 표시
- 작성자별 필터링 및 정렬 기능 제공

### 2-2-4. 스타일/디자인 가이드라인

- Recharts 라이브러리를 사용한 통계 차트 구현
- 테이블 형태의 데이터 표시 및 정렬 기능 구현
- 반응형 디자인으로 모바일 환경 지원

### 2-2-5. BE-FE 데이터 구조 및 통신 방법 명세

- 백엔드 API 응답에 맞는 TypeScript 인터페이스 정의
- Axios를 사용한 API 호출 및 응답 처리 예시

```typescript
// 릴리즈 커밋 통계 인터페이스
interface AuthorStat {
  author: string;
  commits: number;
  additions: number;
  deletions: number;
  filesChanged: number;
}

interface ReleaseComparison {
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  totalFilesChanged: number;
  authorStats: AuthorStat[];
}

interface ReleaseStats {
  tagName: string;
  name: string;
  publishedAt: string;
  compareWithPrevious: ReleaseComparison;
}

interface RepositoryReleaseStats {
  repository: string;
  releases: ReleaseStats[];
}

// API 호출 예시
const fetchReleaseStats = async (repository: string, startDate?: string, endDate?: string) => {
  try {
    const response = await axios.get('/api/github/releases/stats', {
      params: { repository, startDate, endDate }
    });
    return response.data as RepositoryReleaseStats;
  } catch (error) {
    // 에러 처리
    console.error('Failed to fetch release stats:', error);
    throw error;
  }
};
```

## 2-3. API 명세

### 2-3-1. 엔드포인트: `GET /api/github/releases/stats`

### 2-3-2. 요청 매개변수:

```json
{
  "repository": "string",         // GitHub 저장소 경로 (예: "owner/repo")
  "startDate": "string",        // 조회 시작 날짜 (선택적, ISO 형식)
  "endDate": "string"          // 조회 종료 날짜 (선택적, ISO 형식)
}
```

### 2-3-3. 응답 형식:

```json
{
  "repository": "string",
  "releases": [
    {
      "tagName": "string",
      "name": "string",
      "publishedAt": "string",
      "compareWithPrevious": {
        "totalCommits": 0,
        "totalAdditions": 0,
        "totalDeletions": 0,
        "totalFilesChanged": 0,
        "authorStats": [
          {
            "author": "string",
            "commits": 0,
            "additions": 0,
            "deletions": 0,
            "filesChanged": 0
          }
        ]
      }
    }
  ]
}
```

### 2-3-4. 오류 케이스 및 코드

- 400: 잘못된 요청 매개변수 (저장소 경로 누락 등)
- 401: 인증 오류
- 404: 저장소를 찾을 수 없음
- 429: API 요청 제한 초과
- 500: 서버 내부 오류
