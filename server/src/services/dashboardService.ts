import { ProcessedRelease } from '../types/githubTypes';
import { 
  DashboardData, 
  DashboardFilterParams, 
  TimeSeriesDataPoint, 
  SummaryStats, 
  TopRepository, 
  ReleaseTypeBreakdown 
} from '../types/dashboardTypes';
import { 
  calculateDailyStatistics, 
  calculateMonthlyStatistics, 
  calculateWeeklyStatistics,
  calculateWorkingDaysBetweenReleases
} from './statisticsService';
import { parseISODate } from '../utils/dateUtils';

// In-memory cache for dashboard data
const dashboardCache = new Map<string, { data: DashboardData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Filters releases based on dashboard filter parameters
 * @param releases All processed releases
 * @param params Dashboard filter parameters
 * @returns Filtered releases
 */
function filterReleases(releases: ProcessedRelease[], params: DashboardFilterParams): ProcessedRelease[] {
  let filteredReleases = [...releases];
  console.log(params);
  // Filter by date range
  if (params.startDate) {
    const startDate = new Date(params.startDate);
    filteredReleases = filteredReleases.filter(release => 
      new Date(release.published_at) >= startDate
    );
  }

  if (params.endDate) {
    const endDate = new Date(params.endDate);
    filteredReleases = filteredReleases.filter(release => 
      new Date(release.published_at) <= endDate
    );
  }

  // Filter by repository
  if (params.filters?.repository && params.filters.repository.length > 0) {
    filteredReleases = filteredReleases.filter(release =>
      params.filters!.repository!.includes(release.repository)
    );
  }

  // Filter by release type (prerelease vs. regular release)
  // Note: This would require additional data from the GitHub API
  // For now, we'll assume all releases are regular releases
  
  return filteredReleases;
}

/**
 * Generates time series data based on timeframe
 * @param releases Filtered releases
 * @param timeframe Timeframe (daily, weekly, monthly)
 * @returns Array of time series data points
 */
function generateTimeSeriesData(releases: ProcessedRelease[], timeframe: string): TimeSeriesDataPoint[] {
  let timeSeriesData: TimeSeriesDataPoint[] = [];

  switch (timeframe) {
    case 'daily':
      const dailyStats = calculateDailyStatistics(releases);
      timeSeriesData = dailyStats.map(stat => ({
        date: stat.date,
        releaseCount: stat.release_count,
        commitCount: 0, // This would require additional data from GitHub API
        contributorCount: 0 // This would require additional data from GitHub API
      }));
      break;
    case 'weekly':
      const weeklyStats = calculateWeeklyStatistics(releases);
      timeSeriesData = weeklyStats.map(stat => ({
        date: `${stat.year}-W${stat.week.toString().padStart(2, '0')}`,
        releaseCount: stat.release_count,
        commitCount: 0, // This would require additional data from GitHub API
        contributorCount: 0 // This would require additional data from GitHub API
      }));
      break;
    case 'monthly':
      const monthlyStats = calculateMonthlyStatistics(releases);
      timeSeriesData = monthlyStats.map(stat => ({
        date: `${stat.year}-${stat.month.toString().padStart(2, '0')}`,
        releaseCount: stat.release_count,
        commitCount: 0, // This would require additional data from GitHub API
        contributorCount: 0 // This would require additional data from GitHub API
      }));
      break;
    default:
      // Default to daily if timeframe is not recognized
      const defaultDailyStats = calculateDailyStatistics(releases);
      timeSeriesData = defaultDailyStats.map(stat => ({
        date: stat.date,
        releaseCount: stat.release_count,
        commitCount: 0,
        contributorCount: 0
      }));
  }

  return timeSeriesData;
}

/**
 * Calculates summary statistics
 * @param releases Filtered releases
 * @returns Summary statistics
 */
function calculateSummaryStats(releases: ProcessedRelease[]): SummaryStats {
  const totalReleases = releases.length;
  
  // Calculate average time between releases
  const workingDaysBetweenReleases = calculateWorkingDaysBetweenReleases(releases);
  const avgTimeToRelease = workingDaysBetweenReleases.length > 0
    ? workingDaysBetweenReleases.reduce((sum, stat) => sum + stat.working_days_since_previous_release, 0) / workingDaysBetweenReleases.length
    : 0;

  return {
    totalReleases,
    totalCommits: 0, // This would require additional data from GitHub API
    totalContributors: 0, // This would require additional data from GitHub API
    averageCommitsPerRelease: 0, // This would require additional data from GitHub API
    averageTimeToRelease: avgTimeToRelease
  };
}

/**
 * Calculates top repositories by release count
 * @param releases Filtered releases
 * @returns Array of top repositories
 */
function calculateTopRepositories(releases: ProcessedRelease[]): TopRepository[] {
  const repoMap = new Map<string, { releaseCount: number; commitCount: number }>();

  releases.forEach(release => {
    const repo = repoMap.get(release.repository) || { releaseCount: 0, commitCount: 0 };
    repo.releaseCount += 1;
    repoMap.set(release.repository, repo);
  });

  return Array.from(repoMap.entries()).map(([name, stats]) => ({
    name,
    releaseCount: stats.releaseCount,
    commitCount: stats.commitCount
  }));
}

/**
 * Calculates release type breakdown
 * @param releases Filtered releases
 * @returns Array of release type breakdown
 */
function calculateReleaseTypeBreakdown(releases: ProcessedRelease[]): ReleaseTypeBreakdown[] {
  // For now, we'll assume all releases are regular releases
  // This would require additional data from the GitHub API to determine release types
  const totalReleases = releases.length;
  
  return [
    {
      type: 'regular',
      count: totalReleases,
      percentage: 100
    }
  ];
}

/**
 * Generates dashboard data based on filter parameters
 * @param releases All processed releases
 * @param params Dashboard filter parameters
 * @returns Dashboard data
 */
export function generateDashboardData(releases: ProcessedRelease[], params: DashboardFilterParams): DashboardData {

  // Filter releases based on parameters
  const filteredReleases = filterReleases(releases, params);

  // Generate time series data
  const timeSeriesData = generateTimeSeriesData(filteredReleases, params.timeframe);

  // Calculate summary statistics
  const summaryStats = calculateSummaryStats(filteredReleases);

  // Calculate top repositories
  const topRepositories = calculateTopRepositories(filteredReleases);

  // Calculate release type breakdown
  const releaseTypeBreakdown = calculateReleaseTypeBreakdown(filteredReleases);

  return {
    timeSeriesData,
    summaryStats,
    topRepositories,
    releaseTypeBreakdown
  };
}

/**
 * Gets dashboard data with caching
 * @param releases All processed releases
 * @param params Dashboard filter parameters
 * @returns Dashboard data
 */
export function getDashboardData(releases: ProcessedRelease[], params: DashboardFilterParams): DashboardData {
  // Create a cache key based on the filter parameters
  const cacheKey = JSON.stringify(params);
  // Check if we have cached data and it's still valid
  const cachedData = dashboardCache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
    return cachedData.data;
  }
  
  // Generate new dashboard data
  const dashboardData = generateDashboardData(releases, params);
  
  // Cache the data
  dashboardCache.set(cacheKey, {
    data: dashboardData,
    timestamp: Date.now()
  });
  
  return dashboardData;
}

/**
 * Clears the dashboard data cache
 */
export function clearDashboardCache(): void {
  dashboardCache.clear();
}

export default {
  generateDashboardData,
  getDashboardData,
  clearDashboardCache
};