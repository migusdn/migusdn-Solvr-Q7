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
 * @param releaseStats Optional repository release stats for commit and contributor counts
 * @returns Array of time series data points
 */
function generateTimeSeriesData(
  releases: ProcessedRelease[], 
  timeframe: string,
  releaseStats?: RepositoryReleaseStats[]
): TimeSeriesDataPoint[] {
  let timeSeriesData: TimeSeriesDataPoint[] = [];

  // Create maps to store commit and contributor counts by date
  const commitCountByDate = new Map<string, number>();
  const contributorCountByDate = new Map<string, number>();
  const contributorsByDate = new Map<string, Set<string>>();

  // Process release stats to extract commit and contributor counts if available
  if (releaseStats && releaseStats.length > 0) {
    releaseStats.forEach(repoStats => {
      repoStats.releases.forEach(release => {
        const releaseDate = new Date(release.publishedAt);
        const dateStr = releaseDate.toISOString().split('T')[0]; // YYYY-MM-DD

        // For daily stats
        const dailyKey = dateStr;

        // For weekly stats
        const weekDate = new Date(releaseDate);
        weekDate.setHours(0, 0, 0, 0);
        weekDate.setDate(weekDate.getDate() + 3 - (weekDate.getDay() + 6) % 7);
        const week = Math.floor((weekDate.getTime() - new Date(weekDate.getFullYear(), 0, 4).getTime()) / 86400000 / 7) + 1;
        const weeklyKey = `${releaseDate.getFullYear()}-W${week.toString().padStart(2, '0')}`;

        // For monthly stats
        const monthlyKey = `${releaseDate.getFullYear()}-${(releaseDate.getMonth() + 1).toString().padStart(2, '0')}`;

        // Determine which key to use based on timeframe
        let key;
        switch (timeframe) {
          case 'daily':
            key = dailyKey;
            break;
          case 'weekly':
            key = weeklyKey;
            break;
          case 'monthly':
            key = monthlyKey;
            break;
          default:
            key = dailyKey;
        }

        // Update commit count
        const currentCommits = commitCountByDate.get(key) || 0;
        commitCountByDate.set(key, currentCommits + release.compareWithPrevious.totalCommits);

        // Update contributor set
        if (!contributorsByDate.has(key)) {
          contributorsByDate.set(key, new Set<string>());
        }

        // Add all contributors from this release
        release.compareWithPrevious.authorStats.forEach(author => {
          contributorsByDate.get(key)?.add(author.author);
        });
      });
    });

    // Convert contributor sets to counts
    contributorsByDate.forEach((contributors, key) => {
      contributorCountByDate.set(key, contributors.size);
    });
  }

  switch (timeframe) {
    case 'daily':
      const dailyStats = calculateDailyStatistics(releases);
      timeSeriesData = dailyStats.map(stat => ({
        date: stat.date,
        releaseCount: stat.release_count,
        commitCount: commitCountByDate.get(stat.date) || 0,
        contributorCount: contributorCountByDate.get(stat.date) || 0
      }));
      break;
    case 'weekly':
      const weeklyStats = calculateWeeklyStatistics(releases);
      timeSeriesData = weeklyStats.map(stat => {
        const weekKey = `${stat.year}-W${stat.week.toString().padStart(2, '0')}`;
        return {
          date: weekKey,
          releaseCount: stat.release_count,
          commitCount: commitCountByDate.get(weekKey) || 0,
          contributorCount: contributorCountByDate.get(weekKey) || 0
        };
      });
      break;
    case 'monthly':
      const monthlyStats = calculateMonthlyStatistics(releases);
      timeSeriesData = monthlyStats.map(stat => {
        const monthKey = `${stat.year}-${stat.month.toString().padStart(2, '0')}`;
        return {
          date: monthKey,
          releaseCount: stat.release_count,
          commitCount: commitCountByDate.get(monthKey) || 0,
          contributorCount: contributorCountByDate.get(monthKey) || 0
        };
      });
      break;
    default:
      // Default to daily if timeframe is not recognized
      const defaultDailyStats = calculateDailyStatistics(releases);
      timeSeriesData = defaultDailyStats.map(stat => ({
        date: stat.date,
        releaseCount: stat.release_count,
        commitCount: commitCountByDate.get(stat.date) || 0,
        contributorCount: contributorCountByDate.get(stat.date) || 0
      }));
  }

  return timeSeriesData;
}

/**
 * Calculates summary statistics
 * @param releases Filtered releases
 * @returns Summary statistics
 */
async function calculateSummaryStats(releases: ProcessedRelease[], params?: DashboardFilterParams): Promise<SummaryStats> {
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
    // Create a map to track processed releases by tag name to avoid double-counting
    const processedReleaseTags = new Set<string>();

    for (const repository of repositories) {
      // Format repository as 'owner/repo'
      const formattedRepo = `daangn/${repository}`;
      const repoStats = await import('../services/githubService.js')
        .then(module => module.default.fetchRepositoryReleaseStats(
          formattedRepo,
          params?.startDate,
          params?.endDate
        ));

      if (repoStats && repoStats.releases) {
        // Aggregate statistics, avoiding double-counting
        repoStats.releases.forEach((release: any) => {
          // Create a unique identifier for this release
          const releaseKey = `${repository}-${release.tagName}`;

          // Only process this release if we haven't seen it before
          if (!processedReleaseTags.has(releaseKey)) {
            processedReleaseTags.add(releaseKey);

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
          }
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
 * @param releaseStats Optional repository release stats for commit counts
 * @returns Array of top repositories
 */
function calculateTopRepositories(
  releases: ProcessedRelease[], 
  releaseStats?: RepositoryReleaseStats[]
): TopRepository[] {
  const repoMap = new Map<string, { releaseCount: number; commitCount: number }>();

  // Initialize repo map with release counts
  releases.forEach(release => {
    const repo = repoMap.get(release.repository) || { releaseCount: 0, commitCount: 0 };
    repo.releaseCount += 1;
    repoMap.set(release.repository, repo);
  });

  // Add commit counts from release stats if available
  if (releaseStats && releaseStats.length > 0) {
    releaseStats.forEach(repoStat => {
      const repoName = repoStat.repository;
      if (repoMap.has(repoName)) {
        let totalCommits = 0;
        repoStat.releases.forEach(release => {
          totalCommits += release.compareWithPrevious.totalCommits;
        });

        const repo = repoMap.get(repoName)!;
        repo.commitCount = totalCommits;
        repoMap.set(repoName, repo);
      }
    });
  }

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

  // Generate time series data with release stats
  const timeSeriesData = generateTimeSeriesData(filteredReleases, params.timeframe, releaseStats);

  // Calculate summary statistics (now async)
  const summaryStats = await calculateSummaryStats(filteredReleases, params);
  console.log(summaryStats);
  // Calculate top repositories with commit counts from release stats
  const topRepositories = calculateTopRepositories(filteredReleases, releaseStats);

  // Calculate release type breakdown
  const releaseTypeBreakdown = calculateReleaseTypeBreakdown(filteredReleases);

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
