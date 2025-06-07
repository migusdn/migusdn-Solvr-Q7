# TASK 3: 릴리즈 데이터 타입 정의

## 3-1. 핵심 기능 목록

- 릴리즈 커밋 통계를 위한 데이터 타입 정의
- 작성자별 통계 데이터 타입 정의
- 기존 타입과의 통합

## 3-2. 백엔드 요구사항

### 3-2-1. 데이터 타입 정의

- 릴리즈 커밋 통계를 저장할 데이터 타입 인터페이스 정의
- 작성자별 커밋 통계를 저장할 데이터 타입 인터페이스 정의
- 기존 `githubTypes.ts` 파일에 추가

### 3-2-2. 통계 타입 스키마 작성

- 각 릴리즈별 통계 비교 데이터 스키마 정의
- 작성자별 통계 데이터 스키마 정의

### 3-2-3. 타입 문서화

- 각 필드에 대한 주석 설명 추가
- 타입 사용법 예시 제공

### 3-2-4. 타입 파일 업데이트

- 서버의 타입 파일 업데이트
- 클라이언트와 서버 간 공유 타입 일관성 보장

## 3-3. 타입 정의 명세

### 3-3-1. 새로운 타입 인터페이스

```typescript
// 작성자별 커밋 통계 인터페이스
export interface AuthorCommitStats {
  author: string;        // 작성자 이름 또는 아이디
  commits: number;       // 커밋 수
  additions: number;     // 추가된 코드 라인 수
  deletions: number;     // 삭제된 코드 라인 수
  filesChanged: number;  // 변경된 파일 수
}

// 릴리즈 비교 통계 인터페이스
export interface ReleaseComparisonStats {
  tagName: string;           // 릴리즈 태그 이름
  previousTagName: string;   // 비교 대상인 이전 릴리즈 태그 이름
  totalCommits: number;      // 총 커밋 수
  totalAdditions: number;    // 총 추가된 코드 라인 수
  totalDeletions: number;    // 총 삭제된 코드 라인 수
  totalFilesChanged: number; // 총 변경된 파일 수
  authorStats: AuthorCommitStats[]; // 작성자별 통계
}

// 저장소 릴리즈 통계 인터페이스
export interface RepositoryReleaseStats {
  repository: string;                // 저장소 이름 (owner/repo 형식)
  releaseStats: ReleaseComparisonStats[]; // 릴리즈별 통계 데이터
}
```

### 3-3-2. 기존 타입과의 통합 방안

- `githubTypes.ts` 파일에 새로운 인터페이스 추가
- 기존 `ReleaseDetails` 인터페이스와 연결하여 사용할 수 있도록 구성
- 필요한 경우 `ProcessedRelease` 인터페이스에 통계 필드 추가
