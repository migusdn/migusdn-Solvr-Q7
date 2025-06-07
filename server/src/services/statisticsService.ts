import { ProcessedRelease } from '../types/githubTypes';
import { isWorkingDay, parseISODate, getWorkingDaysBetween } from '../utils/dateUtils';

/**
 * Interface for yearly statistics
 */
export interface YearlyStatistic {
  repository: string;
  year: number;
  release_count: number;
  working_day_count: number;
}

/**
 * Interface for monthly statistics
 */
export interface MonthlyStatistic {
  repository: string;
  year: number;
  month: number;
  release_count: number;
  working_day_count: number;
}

/**
 * Interface for weekly statistics
 */
export interface WeeklyStatistic {
  repository: string;
  year: number;
  week: number;
  release_count: number;
  working_day_count: number;
}

/**
 * Interface for daily statistics
 */
export interface DailyStatistic {
  repository: string;
  date: string;
  release_count: number;
  is_working_day: boolean;
}

/**
 * Interface for comparison statistics
 */
export interface ComparisonStatistic {
  metric: string;
  stackflow_value: number;
  seed_design_value: number;
  difference: number;
  percentage_difference: number;
}

/**
 * Interface for working days between releases statistics
 */
export interface WorkingDaysBetweenReleasesStatistic {
  repository: string;
  release_tag: string;
  working_days_since_previous_release: number;
}

/**
 * Calculates yearly statistics from processed releases
 * @param releases Processed release data
 * @returns Array of yearly statistics
 */
export function calculateYearlyStatistics(releases: ProcessedRelease[]): YearlyStatistic[] {
  const yearlyStats: Map<string, YearlyStatistic> = new Map();

  releases.forEach(release => {
    const key = `${release.repository}-${release.year}`;
    const releaseDate = parseISODate(release.published_at);
    const isWorkDay = isWorkingDay(releaseDate);

    if (yearlyStats.has(key)) {
      const stat = yearlyStats.get(key)!;
      stat.release_count += 1;
      if (isWorkDay) {
        stat.working_day_count += 1;
      }
    } else {
      yearlyStats.set(key, {
        repository: release.repository,
        year: release.year,
        release_count: 1,
        working_day_count: isWorkDay ? 1 : 0
      });
    }
  });

  return Array.from(yearlyStats.values());
}

/**
 * Calculates monthly statistics from processed releases
 * @param releases Processed release data
 * @returns Array of monthly statistics
 */
export function calculateMonthlyStatistics(releases: ProcessedRelease[]): MonthlyStatistic[] {
  const monthlyStats: Map<string, MonthlyStatistic> = new Map();

  releases.forEach(release => {
    const key = `${release.repository}-${release.year}-${release.month}`;
    const releaseDate = parseISODate(release.published_at);
    const isWorkDay = isWorkingDay(releaseDate);

    if (monthlyStats.has(key)) {
      const stat = monthlyStats.get(key)!;
      stat.release_count += 1;
      if (isWorkDay) {
        stat.working_day_count += 1;
      }
    } else {
      monthlyStats.set(key, {
        repository: release.repository,
        year: release.year,
        month: release.month,
        release_count: 1,
        working_day_count: isWorkDay ? 1 : 0
      });
    }
  });

  return Array.from(monthlyStats.values());
}

/**
 * Calculates weekly statistics from processed releases
 * @param releases Processed release data
 * @returns Array of weekly statistics
 */
export function calculateWeeklyStatistics(releases: ProcessedRelease[]): WeeklyStatistic[] {
  const weeklyStats: Map<string, WeeklyStatistic> = new Map();

  releases.forEach(release => {
    const key = `${release.repository}-${release.year}-${release.week}`;
    const releaseDate = parseISODate(release.published_at);
    const isWorkDay = isWorkingDay(releaseDate);

    if (weeklyStats.has(key)) {
      const stat = weeklyStats.get(key)!;
      stat.release_count += 1;
      if (isWorkDay) {
        stat.working_day_count += 1;
      }
    } else {
      weeklyStats.set(key, {
        repository: release.repository,
        year: release.year,
        week: release.week,
        release_count: 1,
        working_day_count: isWorkDay ? 1 : 0
      });
    }
  });

  return Array.from(weeklyStats.values());
}

/**
 * Calculates daily statistics from processed releases
 * @param releases Processed release data
 * @returns Array of daily statistics
 */
export function calculateDailyStatistics(releases: ProcessedRelease[]): DailyStatistic[] {
  const dailyStats: Map<string, DailyStatistic> = new Map();

  releases.forEach(release => {
    const date = release.published_at.split('T')[0]; // Extract YYYY-MM-DD
    const key = `${release.repository}-${date}`;
    const releaseDate = parseISODate(release.published_at);
    const isWorkDay = isWorkingDay(releaseDate);

    if (dailyStats.has(key)) {
      const stat = dailyStats.get(key)!;
      stat.release_count += 1;
    } else {
      dailyStats.set(key, {
        repository: release.repository,
        date,
        release_count: 1,
        is_working_day: isWorkDay
      });
    }
  });

  return Array.from(dailyStats.values());
}

/**
 * Calculates comparison statistics between repositories
 * @param releases Processed release data
 * @returns Array of comparison statistics
 */
export function calculateComparisonStatistics(releases: ProcessedRelease[]): ComparisonStatistic[] {
  // Filter releases by repository
  const stackflowReleases = releases.filter(r => r.repository === 'stackflow');
  const seedDesignReleases = releases.filter(r => r.repository === 'seed-design');

  // Calculate total releases
  const totalStackflow = stackflowReleases.length;
  const totalSeedDesign = seedDesignReleases.length;
  const totalDifference = totalStackflow - totalSeedDesign;
  const totalPercentageDifference = totalSeedDesign === 0 ? 0 : (totalDifference / totalSeedDesign) * 100;

  // Calculate average releases per month
  const stackflowMonthlyStats = calculateMonthlyStatistics(stackflowReleases);
  const seedDesignMonthlyStats = calculateMonthlyStatistics(seedDesignReleases);

  const avgStackflow = stackflowMonthlyStats.length === 0 ? 0 : 
    stackflowMonthlyStats.reduce((sum, stat) => sum + stat.release_count, 0) / stackflowMonthlyStats.length;

  const avgSeedDesign = seedDesignMonthlyStats.length === 0 ? 0 : 
    seedDesignMonthlyStats.reduce((sum, stat) => sum + stat.release_count, 0) / seedDesignMonthlyStats.length;

  const avgDifference = avgStackflow - avgSeedDesign;
  const avgPercentageDifference = avgSeedDesign === 0 ? 0 : (avgDifference / avgSeedDesign) * 100;

  // Calculate max releases in a month
  const maxStackflow = stackflowMonthlyStats.length === 0 ? 0 : 
    Math.max(...stackflowMonthlyStats.map(stat => stat.release_count));

  const maxSeedDesign = seedDesignMonthlyStats.length === 0 ? 0 : 
    Math.max(...seedDesignMonthlyStats.map(stat => stat.release_count));

  const maxDifference = maxStackflow - maxSeedDesign;
  const maxPercentageDifference = maxSeedDesign === 0 ? 0 : (maxDifference / maxSeedDesign) * 100;

  return [
    {
      metric: 'total_releases',
      stackflow_value: totalStackflow,
      seed_design_value: totalSeedDesign,
      difference: totalDifference,
      percentage_difference: totalPercentageDifference
    },
    {
      metric: 'avg_releases_per_month',
      stackflow_value: avgStackflow,
      seed_design_value: avgSeedDesign,
      difference: avgDifference,
      percentage_difference: avgPercentageDifference
    },
    {
      metric: 'max_releases_in_month',
      stackflow_value: maxStackflow,
      seed_design_value: maxSeedDesign,
      difference: maxDifference,
      percentage_difference: maxPercentageDifference
    }
  ];
}

/**
 * Calculates working days between releases statistics
 * @param releases Processed release data
 * @returns Array of working days between releases statistics
 */
export function calculateWorkingDaysBetweenReleases(releases: ProcessedRelease[]): WorkingDaysBetweenReleasesStatistic[] {
  // Group releases by repository
  const releasesByRepo: Record<string, ProcessedRelease[]> = {};

  releases.forEach(release => {
    if (!releasesByRepo[release.repository]) {
      releasesByRepo[release.repository] = [];
    }
    releasesByRepo[release.repository].push(release);
  });

  const result: WorkingDaysBetweenReleasesStatistic[] = [];

  // Process each repository separately
  Object.entries(releasesByRepo).forEach(([repository, repoReleases]) => {
    // Sort releases by published date (oldest first)
    const sortedReleases = [...repoReleases].sort(
      (a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
    );

    // Calculate working days between consecutive releases
    for (let i = 1; i < sortedReleases.length; i++) {
      const currentRelease = sortedReleases[i];
      const previousRelease = sortedReleases[i - 1];

      const currentDate = parseISODate(currentRelease.published_at);
      const previousDate = parseISODate(previousRelease.published_at);

      const workingDays = getWorkingDaysBetween(previousDate, currentDate);

      result.push({
        repository,
        release_tag: currentRelease.tag_name,
        working_days_since_previous_release: workingDays
      });
    }
  });

  return result;
}

/**
 * Calculates the total number of releases on working days
 * @param releases Processed release data
 * @returns Number of releases on working days
 */
export function calculateWorkingDayReleaseCount(releases: ProcessedRelease[]): number {
  return releases.filter(release => {
    const releaseDate = parseISODate(release.published_at);
    return isWorkingDay(releaseDate);
  }).length;
}

/**
 * Calculates all statistics from processed releases
 * @param releases Processed release data
 * @returns Object containing all statistics
 */
export function calculateAllStatistics(releases: ProcessedRelease[]) {
  return {
    releaseCount: releases.length,
    workingDayReleaseCount: calculateWorkingDayReleaseCount(releases),
    yearlyStats: calculateYearlyStatistics(releases),
    monthlyStats: calculateMonthlyStatistics(releases),
    weeklyStats: calculateWeeklyStatistics(releases),
    dailyStats: calculateDailyStatistics(releases),
    comparisonStats: calculateComparisonStatistics(releases),
    workingDaysBetweenReleases: calculateWorkingDaysBetweenReleases(releases)
  };
}

export default {
  calculateYearlyStatistics,
  calculateMonthlyStatistics,
  calculateWeeklyStatistics,
  calculateDailyStatistics,
  calculateComparisonStatistics,
  calculateWorkingDaysBetweenReleases,
  calculateWorkingDayReleaseCount,
  calculateAllStatistics
};
