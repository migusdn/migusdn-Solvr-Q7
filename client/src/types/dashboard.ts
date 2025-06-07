/**
 * Dashboard types
 */

/**
 * Dashboard filter parameters
 */
export interface DashboardFilterParams {
  timeframe: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
  filters?: {
    repository?: string[];
    releaseType?: string[];
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  date: string;
  releaseCount: number;
  commitCount: number;
  contributorCount: number;
}

/**
 * Summary statistics
 */
export interface SummaryStats {
  totalReleases: number;
  totalCommits: number;
  totalContributors: number;
  averageCommitsPerRelease: number;
  averageTimeToRelease: number;
  // Extended statistics for release data
  totalAdditions?: number;
  totalDeletions?: number;
  totalFilesChanged?: number;
  recentReleases?: {
    tagName: string;
    name: string;
    publishedAt: string;
    commitCount: number;
    additions: number;
    deletions: number;
    filesChanged: number;
  }[];
  topContributors?: {
    author: string;
    commits: number;
    additions: number;
    deletions: number;
    filesChanged: number;
    contributionPercentage: number;
  }[];
}

/**
 * Top repository data
 */
export interface TopRepository {
  name: string;
  releaseCount: number;
  commitCount: number;
}

/**
 * Release type breakdown
 */
export interface ReleaseTypeBreakdown {
  type: string;
  count: number;
  percentage: number;
}

/**
 * Dashboard data
 */
export interface DashboardData {
  timeSeriesData: TimeSeriesDataPoint[];
  summaryStats: SummaryStats;
  topRepositories: TopRepository[];
  releaseTypeBreakdown: ReleaseTypeBreakdown[];
}

/**
 * Dashboard response
 */
export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

/**
 * Error response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}
