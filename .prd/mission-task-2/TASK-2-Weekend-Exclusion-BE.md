# 기능 상세 및 요구사항

## Task 2: [주말 제외 통계 계산 - BE]

### 2-1. 핵심 기능 목록
- GitHub 릴리즈 통계 계산 시 주말(토요일, 일요일)을 근무일수에서 제외
- 근무일 기준으로 릴리즈 빈도 및 패턴 분석 기능 개선
- 주말 제외 통계를 CSV 파일로 내보내기

### 2-2. 백엔드 요구사항

#### 2-2-1. 근무일 판별 기능 구현
- 날짜를 입력받아 해당 날짜가 주말(토요일, 일요일)인지 판별하는 유틸리티 함수 개발
- 각 릴리즈 날짜가 근무일인지 여부를 확인하고 데이터에 플래그 추가

#### 2-2-2. 통계 계산 로직 수정
- 기존 통계 계산 로직을 수정하여 주말을 제외한 근무일 기준으로 통계 생성
- 연간, 월간, 주간 통계에 근무일 기준 릴리즈 수 추가
- 근무일 간격(working days between releases) 통계 추가

#### 2-2-3. 주말 제외 CSV 내보내기
- 기존 CSV 파일 형식을 확장하여 근무일 기준 통계 포함
- 주말을 제외한 근무일 통계와 전체 통계를 함께 제공하여 비교 가능하게 함

#### 2-2-4. 데이터 구조 및 통신 방식 명세
- 기존 통계 데이터 구조에 근무일 관련 필드 추가

```json
{
  "repository": "string",
  "releaseCount": "number",
  "workingDayReleaseCount": "number",
  "yearlyStats": [
    { "year": "number", "count": "number", "workingDayCount": "number" }
  ],
  "monthlyStats": [
    { "year": "number", "month": "number", "count": "number", "workingDayCount": "number" }
  ],
  "weeklyStats": [
    { "year": "number", "week": "number", "count": "number", "workingDayCount": "number" }
  ],
  "dailyStats": [
    { "date": "string", "count": "number", "isWorkingDay": "boolean" }
  ],
  "workingDaysBetweenReleases": [
    { "releaseTag": "string", "workingDaysSincePreviousRelease": "number" }
  ]
}
```

### 2-3. 기술적 요구사항

#### 2-3-1. 날짜 처리 유틸리티 함수
- 날짜 객체를 입력받아 해당 날짜가 주말인지 판별하는 함수 구현
- 두 날짜 사이의 근무일수를 계산하는 함수 구현

```typescript
// 예시 인터페이스
interface DateUtils {
  isWeekend(date: Date): boolean;
  getWorkingDaysBetween(startDate: Date, endDate: Date): number;
}
```

#### 2-3-2. 통계 서비스 수정
- 기존 통계 서비스에 근무일 기준 통계 계산 기능 추가
- 근무일 관련 통계를 병합하여 통합된 통계 정보 제공

#### 2-3-3. 필요한 수정 파일
- `server/src/utils/dateUtils.ts` (새로 생성)
- `server/src/services/statisticsService.ts` (수정)
- `server/src/services/csvService.ts` (수정)

### 2-4. 테스트 요구사항

#### 2-4-1. 단위 테스트
- 날짜 유틸리티 함수에 대한 테스트 케이스 작성
  - 주말 판별 함수 테스트
  - 근무일수 계산 함수 테스트
- 통계 계산 함수에 대한 테스트 케이스 작성

#### 2-4-2. 통합 테스트
- 실제 릴리즈 데이터를 사용하여 주말을 제외한 통계가 올바르게 계산되는지 검증
- CSV 파일 생성 기능 테스트

### 2-5. 성능 요구사항

- 대용량 릴리즈 데이터 처리 시에도 성능 저하가 없도록 최적화
- 날짜 계산 및 필터링 로직의 효율성 보장
