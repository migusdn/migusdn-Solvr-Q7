# TASK 1: 릴리즈 커밋 통계 - 백엔드(BE)

## 1-1. 핵심 기능 목록

- GitHub 저장소의 모든 릴리즈(tag) 조회
- 릴리즈 간 비교 통계 데이터 수집 (커밋 수, 추가/삭제된 코드 라인 수, 변경된 파일 수)
- 작성자별 통계 집계
- JSON 형태로 데이터 반환

## 1-2. 백엔드 요구사항

### 1-2-1. 데이터 모델 정의

- 릴리즈 커밋 통계를 저장할 데이터 타입 인터페이스 정의
- 작성자별 커밋 통계를 저장할 데이터 타입 인터페이스 정의

### 1-2-2. GitHub API 연동 로직 구현

- GitHub API를 통해 저장소의 모든 릴리즈 목록 조회
- 각 릴리즈별 비교 API 호출을 통해 통계 데이터 수집
- 작성자별 집계를 위한 데이터 처리 로직 구현

### 1-2-3. API 엔드포인트 구현

- `/api/github/releases/stats` 엔드포인트 구현
- 선택적 매개변수로 특정 저장소, 날짜 범위 지정 기능 제공

### 1-2-4. BE-FE 데이터 구조 및 통신 방법 명세

- 요청/응답 JSON 스키마 정의
- REST API 엔드포인트 상세 정보 제공

## 1-3. API 명세

### 1-3-1. 엔드포인트: `GET /api/github/releases/stats`

### 1-3-2. 요청 매개변수:

```json
{
  "repository": "string",         // GitHub 저장소 경로 (예: "owner/repo")
  "startDate": "string",        // 조회 시작 날짜 (선택적, ISO 형식)
  "endDate": "string"          // 조회 종료 날짜 (선택적, ISO 형식)
}
```

### 1-3-3. 응답 형식:

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

### 1-3-4. 오류 케이스 및 코드

- 400: 잘못된 요청 매개변수 (저장소 경로 누락 등)
- 401: GitHub API 인증 오류
- 404: 저장소를 찾을 수 없음
- 429: GitHub API 요청 제한 초과
- 500: 서버 내부 오류
