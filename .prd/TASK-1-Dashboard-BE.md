# TASK 1: 대시보드 - 백엔드 (BE)

## 1-1. 핵심 기능 목록
- 기존 GitHub 릴리스 데이터를 기반으로 대시보드 데이터 API 제공
- 통계 데이터를 조회할 수 있는 엔드포인트 구현
- 시간별/일별/월별 집계 데이터 제공
- 필터링 및 정렬 기능 지원

## 1-2. 백엔드 요구사항

### 1-2-1. 통계 데이터 API 엔드포인트 구현
- 대시보드에 필요한 통계 데이터를 제공하는 API 엔드포인트(`GET /api/v1/statistics/dashboard`) 구현
- 기존 `getStatistics` 함수를 확장하여 필터링 및 시간 단위별 집계 기능 추가
- 클라이언트 요청에 따라 데이터를 포맷팅하는 기능 구현

### 1-2-2. 통계 서비스 확장
- `statisticsService.ts` 파일에 대시보드용 데이터 처리 메서드 추가
- 시간별/일별/월별로 데이터를 집계하는 기능 구현
- 데이터를 다양한 포맷(차트용, 테이블용 등)으로 변환하는 유틸리티 추가

### 1-2-3. 캐싱 메커니즘 구현
- 대시보드 데이터 요청의 효율성을 높이기 위한 캐싱 메커니즘 구현
- 캐시 갱신 전략 및 TTL(Time-to-Live) 설정

### 1-2-4. BE-FE 통신을 위한 데이터 구조 및 통신 방법 명시
- 대시보드 데이터 요청/응답 JSON 스키마 정의
- 필터링 및 정렬 파라미터 정의

## 1-3. API 명세

### 1-3-1. 엔드포인트: `GET /api/v1/statistics/dashboard`

### 1-3-2. 요청 파라미터:

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

### 1-3-3. 응답 형식:

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

### 1-3-4. 에러 케이스 및 코드

- 400: 잘못된 요청 파라미터
- 401: 인증되지 않은 요청
- 500: 서버 에러
