# 기능 상세 및 요구사항

## Task 3: [CSV 파일 내보내기 및 저장 - BE]

### 3-1. 핵심 기능 목록
- 계산된 통계 데이터를 CSV 파일로 변환
- 다양한 통계 보고서 생성
- 파일 저장 및 관리

### 3-2. 백엔드 요구사항

#### 3-2-1. CSV 생성 엔진 구현
- 구조화된 데이터를 CSV 형식으로 변환하는 기능 구현
- 적절한 열 헤더 및 데이터 형식 지정
- 특수 문자 및 인코딩 처리

#### 3-2-2. 다양한 통계 보고서 생성
- 종합 릴리즈 목록 보고서 생성
- 시간별(연간, 월간, 주간, 일간) 통계 보고서 생성
- 저장소 간 비교 보고서 생성
- 커스텀 통계 보고서 생성 기능(선택적)

#### 3-2-3. 파일 관리 시스템
- 생성된 CSV 파일 저장 경로 및 이름 지정
- 파일 덮어쓰기/업데이트 정책 설정
- 파일 접근 권한 관리(선택적)

#### 3-2-4. 데이터 구조 및 통신 방식 명세
- CSV 파일 형식 및 구조 정의
- 파일 저장 경로 및 명명 규칙

```json
{
  "csvFiles": [
    {
      "filename": "string",
      "path": "string",
      "headers": ["string"],
      "rows": ["array of values"],
      "description": "string"
    }
  ]
}
```

### 3-3. CSV 파일 형식 상세 명세

#### 3-3-1. 종합 릴리즈 목록 (all_releases.csv)
```
repository,tag_name,name,published_at,created_at,author
stackflow,v1.0.0,Release v1.0.0,2023-01-01T00:00:00Z,2022-12-31T00:00:00Z,username
seed-design,v2.0.0,Seed Design v2.0.0,2023-02-01T00:00:00Z,2023-01-31T00:00:00Z,username
```

#### 3-3-2. 연간 통계 (yearly_statistics.csv)
```
repository,year,release_count
stackflow,2022,10
stackflow,2023,15
seed-design,2022,8
seed-design,2023,12
```

#### 3-3-3. 월간 통계 (monthly_statistics.csv)
```
repository,year,month,release_count
stackflow,2023,1,2
stackflow,2023,2,3
seed-design,2023,1,1
seed-design,2023,2,2
```

#### 3-3-4. 주간 통계 (weekly_statistics.csv)
```
repository,year,week,release_count
stackflow,2023,1,1
stackflow,2023,2,1
seed-design,2023,1,0
seed-design,2023,2,1
```

#### 3-3-5. 일간 통계 (daily_statistics.csv)
```
repository,date,release_count
stackflow,2023-01-01,1
stackflow,2023-01-05,1
seed-design,2023-01-02,0
seed-design,2023-01-07,1
```

#### 3-3-6. 저장소 비교 통계 (comparison_statistics.csv)
```
metric,stackflow_value,seed_design_value,difference,percentage_difference
total_releases,25,20,5,25
avg_releases_per_month,2.1,1.7,0.4,23.5
max_releases_in_month,5,4,1,25
```
