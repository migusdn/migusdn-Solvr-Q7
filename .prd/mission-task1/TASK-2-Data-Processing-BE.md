# 기능 상세 및 요구사항

## Task 2: [릴리즈 데이터 처리 및 통계 생성 - BE]

### 2-1. 핵심 기능 목록
- 수집된 릴리즈 데이터 정리 및 구조화
- 다양한 시간 단위(연간, 월간, 주간, 일간)별 통계 계산
- 통계 데이터를 CSV 형식으로 변환

### 2-2. 백엔드 요구사항

#### 2-2-1. 데이터 정제 및 변환
- GitHub API에서 가져온 원시 릴리즈 데이터 정제
- 날짜 형식 변환 및 표준화
- 중복 데이터 제거 및 오류 처리

#### 2-2-2. 통계 계산 구현
- 연간 릴리즈 수 계산
- 월간 릴리즈 수 계산
- 주간 릴리즈 수 계산
- 일간 릴리즈 수 계산
- 저장소별 릴리즈 비교 통계 생성

#### 2-2-3. CSV 파일 생성
- 계산된 통계 데이터를 CSV 형식으로 변환
- 적절한 열 헤더 및 데이터 형식 정의
- CSV 파일 저장 및 관리

#### 2-2-4. 데이터 구조 및 통신 방식 명세
- 통계 계산을 위한 데이터 구조 정의
- CSV 파일 형식 및 구조 정의

```json
{
  "releaseData": [
    {
      "repository": "string",
      "tag_name": "string",
      "name": "string",
      "published_at": "string",
      "created_at": "string",
      "year": "number",
      "month": "number",
      "week": "number",
      "day": "number"
    }
  ]
}
```

### 2-3. CSV 파일 형식 명세

#### 2-3-1. 저장소별 릴리즈 목록 CSV
- 파일명: `repository_releases.csv`
- 열: repository, tag_name, name, published_at, created_at

#### 2-3-2. 연간 통계 CSV
- 파일명: `yearly_statistics.csv`
- 열: repository, year, release_count

#### 2-3-3. 월간 통계 CSV
- 파일명: `monthly_statistics.csv`
- 열: repository, year, month, release_count

#### 2-3-4. 주간 통계 CSV
- 파일명: `weekly_statistics.csv`
- 열: repository, year, week, release_count

#### 2-3-5. 일간 통계 CSV
- 파일명: `daily_statistics.csv`
- 열: repository, date, release_count

#### 2-3-6. 비교 통계 CSV
- 파일명: `comparison_statistics.csv`
- 열: metric, stackflow_value, seed_design_value, difference
