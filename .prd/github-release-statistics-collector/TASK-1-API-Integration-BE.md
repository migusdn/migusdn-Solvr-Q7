# 기능 상세 및 요구사항

## Task 1: [GitHub Releases API 통합 - BE]

### 1-1. 핵심 기능 목록
- GitHub API를 사용하여 stackflow와 seed-design 저장소의 릴리즈 정보 가져오기
- 릴리즈 데이터 처리 및 저장
- 릴리즈 통계 계산 및 CSV 파일 생성

### 1-2. 백엔드 요구사항

#### 1-2-1. GitHub API 통합 구현
- GitHub REST API를 사용하여 릴리즈 정보 수집
- 두 개의 저장소(stackflow, seed-design)에서 모든 릴리즈 데이터 가져오기
- API 요청 속도 제한 및 오류 처리 구현

#### 1-2-2. 릴리즈 데이터 처리 및 저장
- 가져온 릴리즈 데이터를 처리하고 구조화된 형식으로 변환
- 필요한 정보(릴리즈 날짜, 버전, 태그 이름, 저장소 등) 추출
- 데이터를 메모리 또는 임시 데이터베이스에 저장

#### 1-2-3. 통계 생성 및 CSV 내보내기
- 다양한 통계 메트릭 계산(연간, 월간, 주간, 일간 릴리즈 수)
- 릴리즈 빈도 분석 및 패턴 식별
- 결과를 CSV 파일로 내보내기

#### 1-2-4. 데이터 구조 및 통신 방식 명세
- GitHub API 응답 형식 및 처리된 데이터 구조 정의
- CSV 파일 형식 및 구조 정의

```json
{
  "repository": "string",
  "releaseCount": "number",
  "yearlyStats": [
    { "year": "number", "count": "number" }
  ],
  "monthlyStats": [
    { "year": "number", "month": "number", "count": "number" }
  ],
  "weeklyStats": [
    { "year": "number", "week": "number", "count": "number" }
  ],
  "dailyStats": [
    { "date": "string", "count": "number" }
  ]
}
```

### 1-3. API 명세

#### 1-3-1. GitHub Releases API 엔드포인트
- 엔드포인트: `GET /repos/{owner}/{repo}/releases`
- 파라미터: owner(저장소 소유자), repo(저장소 이름)
- 인증: GitHub 개인 액세스 토큰(선택적)

#### 1-3-2. 응답 형식

```json
[
  {
    "url": "string",
    "html_url": "string",
    "assets_url": "string",
    "upload_url": "string",
    "tarball_url": "string",
    "zipball_url": "string",
    "id": "number",
    "node_id": "string",
    "tag_name": "string",
    "target_commitish": "string",
    "name": "string",
    "body": "string",
    "draft": "boolean",
    "prerelease": "boolean",
    "created_at": "string",
    "published_at": "string",
    "author": {
      "login": "string",
      "id": "number",
      "node_id": "string",
      "avatar_url": "string",
      "url": "string"
    },
    "assets": []
  }
]
```

#### 1-3-3. 오류 사례 및 코드
- 401: 인증 실패
- 403: API 요청 제한 초과
- 404: 저장소를 찾을 수 없음
- 500: 서버 오류
