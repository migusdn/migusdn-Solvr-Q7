import { ProcessedRelease } from '../types/githubTypes';

/**
 * Interface for yearly statistics
 */
export interface YearlyStatistic {
  repository: string;
  year: number;
  release_count: number;
}

/**
 * Interface for monthly statistics
 */
export interface MonthlyStatistic {
  repository: string;
  year: number;
  month: number;
  release_count: number;
}

/**
 * Interface for weekly statistics
 */
export interface WeeklyStatistic {
  repository: string;
  year: number;
  week: number;
  release_count: number;
}

/**
 * Interface for daily statistics
 */
export interface DailyStatistic {
  repository: string;
  date: string;
  release_count: number;
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
 * Calculates yearly statistics from processed releases
 * @param releases Processed release data
 * @returns Array of yearly statistics
 */
export function calculateYearlyStatistics(releases: ProcessedRelease[]): YearlyStatistic[] {
  const yearlyStats: Map<string, YearlyStatistic> = new Map();
  
  releases.forEach(release => {
    const key = `${release.repository}-${release.year}`;
    
    if (yearlyStats.has(key)) {
      const stat = yearlyStats.get(key)!;
      stat.release_count += 1;
    } else {
      yearlyStats.set(key, {
        repository: release.repository,
        year: release.year,
        release_count: 1
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
    
    if (monthlyStats.has(key)) {
      const stat = monthlyStats.get(key)!;
      stat.release_count += 1;
    } else {
      monthlyStats.set(key, {
        repository: release.repository,
        year: release.year,
        month: release.month,
        release_count: 1
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
    
    if (weeklyStats.has(key)) {
      const stat = weeklyStats.get(key)!;
      stat.release_count += 1;
    } else {
      weeklyStats.set(key, {
        repository: release.repository,
        year: release.year,
        week: release.week,
        release_count: 1
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
    
    if (dailyStats.has(key)) {
      const stat = dailyStats.get(key)!;
      stat.release_count += 1;
    } else {
      dailyStats.set(key, {
        repository: release.repository,
        date,
        release_count: 1
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
 * Calculates all statistics from processed releases
 * @param releases Processed release data
 * @returns Object containing all statistics
 */
export function calculateAllStatistics(releases: ProcessedRelease[]) {
  return {
    yearlyStats: calculateYearlyStatistics(releases),
    monthlyStats: calculateMonthlyStatistics(releases),
    weeklyStats: calculateWeeklyStatistics(releases),
    dailyStats: calculateDailyStatistics(releases),
    comparisonStats: calculateComparisonStatistics(releases)
  };
}

export default {
  calculateYearlyStatistics,
  calculateMonthlyStatistics,
  calculateWeeklyStatistics,
  calculateDailyStatistics,
  calculateComparisonStatistics,
  calculateAllStatistics
};