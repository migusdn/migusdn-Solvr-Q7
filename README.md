# GitHub 릴리스 통계 플랫폼

## 프로젝트 개요

GitHub 릴리스 통계 플랫폼은 개발자와 팀을 위한 포괄적인 GitHub 릴리즈 모니터링 및 분석 도구입니다. 이 애플리케이션은 GitHub 저장소의 릴리즈 활동을 실시간으로 추적하고, 시각화된 데이터로 제공하여 프로젝트의 릴리즈 패턴과 추세를 분석할 수 있게 합니다. monorepo 구조로 클라이언트와 서버를 효율적으로 관리하며, 현대적인 웹 개발 기술 스택을 활용합니다.

## 주요 기능

- **실시간 릴리즈 모니터링**: GitHub 저장소의 모든 릴리즈 활동을 실시간으로 추적하고 시각화
- **릴리즈 타입 분석**: 정식 릴리즈와 프리릴리즈 비율을 분석하여 프로젝트의 안정성과 개발 주기 평가
- **다중 저장소 통합**: 여러 GitHub 저장소의 릴리즈 통계를 하나의 대시보드에서 종합적으로 관리 및 비교
- **데이터 내보내기**: 분석 데이터를 CSV 형식으로 내보내기 기능 제공
- **사용자 관리**: 사용자 계정 생성, 조회, 수정, 삭제 기능

## 기술 스택

### 공통

- **패키지 매니저**: pnpm (workspace 기능 활용)
- **언어**: TypeScript
- **Node.js 버전**: 22.x
- **테스트**: Vitest
- **코드 품질**: Prettier

### 클라이언트

- **프레임워크**: React 18
- **상태 관리**: Redux (Redux Toolkit)
- **빌드 도구**: Vite
- **라우팅**: React Router
- **스타일링**: TailwindCSS
- **HTTP 클라이언트**: Axios
- **차트 라이브러리**: Recharts
- **CSV 처리**: PapaParse

### 서버

- **프레임워크**: Fastify
- **데이터베이스**: SQLite with DrizzleORM
- **CORS 지원**: @fastify/cors
- **CSV 처리**: csv-writer
- **환경 변수**: dotenv-safe
- **고유 식별자**: uuid

## 프로젝트 구조

### 클라이언트 구조

```
client/
├── public/           # 정적 파일
├── src/
│   ├── assets/       # 이미지, 폰트 등 자산 파일
│   ├── components/   # 재사용 가능한 UI 컴포넌트
│   ├── hooks/        # 커스텀 React 훅
│   ├── layouts/      # 레이아웃 컴포넌트
│   ├── routes/       # 페이지 컴포넌트
│   ├── services/     # API 서비스
│   ├── store/        # Redux 스토어 및 슬라이스
│   ├── types/        # TypeScript 타입 정의
│   ├── utils/        # 유틸리티 함수
│   ├── App.tsx       # 애플리케이션 루트 컴포넌트
│   └── main.tsx      # 애플리케이션 진입점
```

### 서버 구조

```
server/
├── data/             # 데이터 파일 (CSV, SQLite DB)
│   ├── csv/          # CSV 데이터 파일
│   └── exports/      # 내보내기 파일
├── src/
│   ├── config/       # 설정 파일
│   ├── controllers/  # 요청 처리 컨트롤러
│   ├── db/           # 데이터베이스 관련 코드
│   ├── routes/       # API 라우트 정의
│   ├── services/     # 비즈니스 로직 서비스
│   ├── types/        # TypeScript 타입 정의
│   ├── utils/        # 유틸리티 함수
│   └── index.ts      # 서버 진입점
```

## 설치 및 실행

### 초기 설치

```bash
# 프로젝트 루트 디렉토리에서 실행
pnpm install
```

### 개발 서버 실행

```bash
# 클라이언트 및 서버 동시 실행
pnpm dev

# 클라이언트만 실행
pnpm dev:client

# 서버만 실행
pnpm dev:server
```

### 테스트 실행

```bash
# 클라이언트 테스트
pnpm test:client

# 서버 테스트
pnpm test:server

# 모든 테스트 실행
pnpm test
```

### 빌드

```bash
# 클라이언트 및 서버 빌드
pnpm build
```

## 환경 변수 설정

- **클라이언트**: `client/.env` 파일에 설정 (예시는 `client/.env.example` 참조)
- **서버**: `server/.env` 파일에 설정 (예시는 `server/.env.example` 참조)

## API 엔드포인트

서버는 다음과 같은 API 엔드포인트를 제공합니다:

### 상태 확인
- `GET /api/health`: 서버 상태 확인

### 사용자 관리
- `GET /api/users`: 유저 목록 조회
- `GET /api/users/:id`: 특정 유저 조회
- `POST /api/users`: 새 유저 추가
- `PUT /api/users/:id`: 유저 정보 수정
- `DELETE /api/users/:id`: 유저 삭제

### 대시보드 데이터
- `GET /api/dashboard`: 대시보드 데이터 조회
- `GET /api/dashboard/filters`: 대시보드 필터 옵션 조회

### CSV 데이터
- `GET /api/csv/all-releases`: 모든 릴리즈 데이터 CSV 조회
- `GET /api/csv/statistics`: 통계 데이터 CSV 조회

### 내보내기
- `POST /api/export`: 데이터 내보내기 작업 시작
- `GET /api/export/:id`: 내보내기 작업 상태 조회
- `GET /api/export/:id/download`: 내보내기 파일 다운로드

### GitHub 연동
- `GET /api/github/repositories`: GitHub 저장소 목록 조회
- `GET /api/github/releases/:repo`: 특정 저장소의 릴리즈 목록 조회

## 변경 이력 (Change Log)

### 프로젝트 생성 이후 변경사항
- 대시보드에서 릴리즈 커밋 통계 컴포넌트 제거
- statisticsService 기본 내보내기 간소화
- GitHub 릴리즈 캐싱 로직 추가
- 대시보드 필터 및 정렬 기능 확장
- 대시보드 요약 통계 카드 구현
- 요약 통계 기능 개선
- 대시보드 통계 통합 기능 구현
- 릴리즈 통계 시각화 컴포넌트 구현
- 릴리즈 데이터 타입 정의 추가
- 릴리즈 커밋 통계 프론트엔드 구현
- 릴리즈 커밋 통계 백엔드 구현
- 릴리즈 상세 정보 CSV 파일 추가
- 대시보드 기본 기능 구현
- 프로젝트 초기 설정 완료
