import { ProcessedRelease, RepositoryReleaseStats } from '../types/githubTypes'
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
async function calculateSummaryStats(releases: ProcessedRelease[]): Promise<SummaryStats> {
  const totalReleases = releases.length;

  // Calculate average time between releases
  const workingDaysBetweenReleases = calculateWorkingDaysBetweenReleases(releases);
  const avgTimeToRelease = workingDaysBetweenReleases.length > 0
    ? workingDaysBetweenReleases.reduce((sum, stat) => sum + stat.working_days_since_previous_release, 0) / workingDaysBetweenReleases.length
    : 0;

  // Initialize extended statistics
  let totalCommits = 0;
  let totalAdditions = 0;
  let totalDeletions = 0;
  let totalFilesChanged = 0;
  let totalContributors = 0;
  let recentReleases: any[] = [];
  let contributorMap = new Map<string, {
    commits: number;
    additions: number;
    deletions: number;
    filesChanged: number;
  }>();

  // Get unique repositories from releases
  const repositories = [...new Set(releases.map(release => release.repository))];

  // Fetch release statistics for each repository
  try {
    for (const repository of repositories) {
      // Format repository as 'owner/repo'
      const formattedRepo = `daangn/${repository}`;
      const repoStats = await import('../services/githubService.js')
        .then(module => module.default.fetchRepositoryReleaseStats(formattedRepo));

      if (repoStats && repoStats.releases) {
        // Aggregate statistics
        repoStats.releases.forEach((release: any) => {
          totalCommits += release.compareWithPrevious.totalCommits;
          totalAdditions += release.compareWithPrevious.totalAdditions;
          totalDeletions += release.compareWithPrevious.totalDeletions;
          totalFilesChanged += release.compareWithPrevious.totalFilesChanged;

          // Add to recent releases (limited to 5)
          if (recentReleases.length < 5) {
            recentReleases.push({
              tagName: release.tagName,
              name: release.name,
              publishedAt: release.publishedAt,
              commitCount: release.compareWithPrevious.totalCommits,
              additions: release.compareWithPrevious.totalAdditions,
              deletions: release.compareWithPrevious.totalDeletions,
              filesChanged: release.compareWithPrevious.totalFilesChanged
            });
          }

          // Aggregate contributor statistics
          release.compareWithPrevious.authorStats.forEach((author: any) => {
            const current = contributorMap.get(author.author) || {
              commits: 0,
              additions: 0,
              deletions: 0,
              filesChanged: 0
            };

            contributorMap.set(author.author, {
              commits: current.commits + author.commits,
              additions: current.additions + author.additions,
              deletions: current.deletions + author.deletions,
              filesChanged: current.filesChanged + author.filesChanged
            });
          });
        });
      }
    }

    // Sort recent releases by date (newest first)
    recentReleases.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Calculate total contributors
    totalContributors = contributorMap.size;

    // Calculate average commits per release
    const averageCommitsPerRelease = totalReleases > 0 ? totalCommits / totalReleases : 0;

    // Convert contributor map to array and calculate percentages
    const totalContributorCommits = Array.from(contributorMap.values())
      .reduce((sum, stats) => sum + stats.commits, 0);

    const topContributors = Array.from(contributorMap.entries())
      .map(([author, stats]) => ({
        author,
        commits: stats.commits,
        additions: stats.additions,
        deletions: stats.deletions,
        filesChanged: stats.filesChanged,
        contributionPercentage: totalContributorCommits > 0 
          ? (stats.commits / totalContributorCommits) * 100 
          : 0
      }))
      .sort((a, b) => b.commits - a.commits)
      .slice(0, 10); // Limit to top 10 contributors

    return {
      totalReleases,
      totalCommits,
      totalContributors,
      averageCommitsPerRelease,
      averageTimeToRelease: avgTimeToRelease,
      totalAdditions,
      totalDeletions,
      totalFilesChanged,
      recentReleases,
      topContributors
    };
  } catch (error) {
    console.error('Error fetching release statistics:', error);
    // Return basic stats if extended stats cannot be fetched
    return {
      totalReleases,
      totalCommits: 0,
      totalContributors: 0,
      averageCommitsPerRelease: 0,
      averageTimeToRelease: avgTimeToRelease
    };
  }
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
export async function generateDashboardData(releases: ProcessedRelease[], params: DashboardFilterParams): Promise<DashboardData> {

  // Filter releases based on parameters
  const filteredReleases = filterReleases(releases, params);

  // Generate time series data
  const timeSeriesData = generateTimeSeriesData(filteredReleases, params.timeframe);

  // Calculate summary statistics (now async)
  const summaryStats = await calculateSummaryStats(filteredReleases);
  console.log(summaryStats);
  // Calculate top repositories
  const topRepositories = calculateTopRepositories(filteredReleases);

  // Calculate release type breakdown
  const releaseTypeBreakdown = calculateReleaseTypeBreakdown(filteredReleases);

  // Fetch release stats for all selected repositories
  let releaseStats = undefined;
  if (params.filters?.repository && params.filters.repository.length > 0) {
    try {
      // Import githubService
      const githubService = await import('./githubService.js');

      // Fetch stats for all repositories in parallel
      const statsPromises = params.filters.repository.map(async (repository) => {
        // Format repository as 'owner/repo' if it doesn't already include a '/'
        const formattedRepo = repository.includes('/') ? repository : `daangn/${repository}`;

        try {
          return await githubService.default.fetchRepositoryReleaseStats(
            formattedRepo,
            params.startDate,
            params.endDate
          );
        } catch (error) {
          console.error(`Error fetching release stats for ${formattedRepo}:`, error);
          return null;
        }
      });

      // Wait for all promises to resolve and filter out any null results
      const results = await Promise.all(statsPromises);
      releaseStats = results.filter(Boolean) as RepositoryReleaseStats[];
    } catch (error) {
      console.error('Error fetching release stats:', error);
      // Continue without release stats if there's an error
    }
  }

  return {
    timeSeriesData,
    summaryStats,
    topRepositories,
    releaseTypeBreakdown,
    releaseStats
  };
}

/**
 * Gets dashboard data with caching
 * @param releases All processed releases
 * @param params Dashboard filter parameters
 * @returns Dashboard data
 */
export async function getDashboardData(releases: ProcessedRelease[], params: DashboardFilterParams): Promise<DashboardData> {
  // Create a cache key based on the filter parameters
  const cacheKey = JSON.stringify(params);
  // Check if we have cached data and it's still valid
  const cachedData = dashboardCache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
    return cachedData.data;
  }

  // Generate new dashboard data (now async)
  const dashboardData = await generateDashboardData(releases, params);

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
