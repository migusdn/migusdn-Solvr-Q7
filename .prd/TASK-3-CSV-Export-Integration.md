# TASK 3: 대시보드 데이터 CSV 내보내기 기능

## 3-1. 핵심 기능 목록
- 대시보드에 표시된 데이터를 CSV 형식으로 내보내기 기능
- 현재 적용된 필터를 기반으로 내보내기 수행
- 내보내기 진행 상태 표시 및 다운로드 링크 제공

## 3-2. 백엔드 요구사항

### 3-2-1. CSV 내보내기 API 엔드포인트 확장
- 기존 CSV 서비스를 확장하여 대시보드 데이터 내보내기 지원
- 필터링된 데이터를 CSV 형식으로 변환하는 기능 구현
- 동일한 필터 파라미터를 지원하여 대시보드와 일관성 유지

### 3-2-2. 대용량 데이터 처리 최적화
- 스트리밍 방식으로 CSV 파일 생성하여 메모리 사용 최적화
- 백그라운드 작업으로 처리하여 사용자 요청 차단 방지
- 생성된 파일의 임시 저장 및 제공 메커니즘 구현

### 3-2-3. BE-FE 통신을 위한 데이터 구조 및 통신 방법 명시
- CSV 내보내기 요청/응답 JSON 스키마 정의
- 작업 상태 확인 API 엔드포인트 구현

## 3-3. 프론트엔드 요구사항

### 3-3-1. UI/컴포넌트 구조
- `ExportButton.tsx`: CSV 내보내기 버튼 컴포넌트
- `ExportProgressModal.tsx`: 내보내기 진행 상태 표시 모달

### 3-3-2. 상태 관리 및 데이터 바인딩
- Redux Toolkit 슬라이스(`store/export.ts`)를 사용하여 내보내기 상태 관리
- 내보내기 진행 상태, 에러 상태 관리

### 3-3-3. 상호작용 흐름
- 내보내기 버튼 클릭 → 현재 필터 상태로 API 호출 → 진행 상태 모달 표시
- 백엔드 작업 완료 → 다운로드 링크 활성화 → 사용자 다운로드 가능

### 3-3-4. 스타일/디자인 가이드라인
- 내보내기 버튼은 대시보드 상단에 배치
- 진행 상태는 프로그레스 바로 표시
- 에러 발생 시 알림 및 재시도 옵션 제공

## 3-4. API 명세

### 3-4-1. 엔드포인트: `POST /api/v1/export/dashboard-csv`

### 3-4-2. 요청 파라미터:

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
  },
  "exportOptions": {
    "includeTimeSeriesData": "boolean",
    "includeRepositoryBreakdown": "boolean",
    "includeReleaseTypeBreakdown": "boolean"
  }
}
```

### 3-4-3. 응답 형식:

```json
{
  "success": true,
  "data": {
    "exportId": "string",
    "status": "pending|processing|completed|failed",
    "estimatedTimeRemaining": "number",
    "downloadUrl": "string"
  }
}
```

### 3-4-4. 작업 상태 확인 엔드포인트: `GET /api/v1/export/status/:exportId`

### 3-4-5. 상태 확인 응답 형식:

```json
{
  "success": true,
  "data": {
    "exportId": "string",
    "status": "pending|processing|completed|failed",
    "progress": "number",
    "estimatedTimeRemaining": "number",
    "downloadUrl": "string",
    "error": "string"
  }
}
```

### 3-4-6. 에러 케이스 및 코드

- 400: 잘못된 요청 파라미터
- 401: 인증되지 않은 요청
- 404: 존재하지 않는 내보내기 ID
- 500: 서버 에러
