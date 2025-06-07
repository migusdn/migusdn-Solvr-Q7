/**
 * Release statistics types
 */

/**
 * 작성자별 커밋 통계 인터페이스
 */
export interface AuthorStat {
  author: string;
  commits: number;
  additions: number;
  deletions: number;
  filesChanged: number;
}

/**
 * 릴리즈 비교 통계 인터페이스
 */
export interface ReleaseComparison {
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  totalFilesChanged: number;
  authorStats: AuthorStat[];
}

/**
 * 릴리즈 통계 인터페이스
 */
export interface ReleaseStats {
  tagName: string;
  name: string;
  publishedAt: string;
  compareWithPrevious: ReleaseComparison;
}

/**
 * 저장소 릴리즈 통계 인터페이스
 */
export interface RepositoryReleaseStats {
  repository: string;
  releases: ReleaseStats[];
}

/**
 * 릴리즈 통계 API 응답 인터페이스
 */
export interface ReleaseStatsResponse {
  success: boolean;
  data: RepositoryReleaseStats;
}

/**
 * 릴리즈 통계 필터 매개변수 인터페이스
 */
export interface ReleaseStatsFilterParams {
  repository: string;
  startDate?: string;
  endDate?: string;
}