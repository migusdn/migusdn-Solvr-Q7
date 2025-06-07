import { describe, it, expect } from 'vitest';
import {
  calculateYearlyStatistics,
  calculateMonthlyStatistics,
  calculateWeeklyStatistics,
  calculateDailyStatistics,
  calculateWorkingDaysBetweenReleases,
  calculateWorkingDayReleaseCount,
  calculateAllStatistics
} from './statisticsService';
import { ProcessedRelease } from '../types/githubTypes';

describe('statisticsService', () => {
  // Sample test data with releases on both working days and weekends
  const testReleases: ProcessedRelease[] = [
    // Monday release (working day)
    {
      repository: 'test-repo',
      tag_name: 'v1.0.0',
      name: 'Release 1.0.0',
      published_at: '2023-07-03T12:00:00Z', // Monday
      created_at: '2023-07-03T10:00:00Z',
      author: 'test-user',
      year: 2023,
      month: 7,
      week: 27,
      day: 3
    },
    // Wednesday release (working day)
    {
      repository: 'test-repo',
      tag_name: 'v1.1.0',
      name: 'Release 1.1.0',
      published_at: '2023-07-05T12:00:00Z', // Wednesday
      created_at: '2023-07-05T10:00:00Z',
      author: 'test-user',
      year: 2023,
      month: 7,
      week: 27,
      day: 5
    },
    // Saturday release (weekend)
    {
      repository: 'test-repo',
      tag_name: 'v1.2.0',
      name: 'Release 1.2.0',
      published_at: '2023-07-08T12:00:00Z', // Saturday
      created_at: '2023-07-08T10:00:00Z',
      author: 'test-user',
      year: 2023,
      month: 7,
      week: 27,
      day: 8
    },
    // Monday next week release (working day)
    {
      repository: 'test-repo',
      tag_name: 'v1.3.0',
      name: 'Release 1.3.0',
      published_at: '2023-07-10T12:00:00Z', // Monday
      created_at: '2023-07-10T10:00:00Z',
      author: 'test-user',
      year: 2023,
      month: 7,
      week: 28,
      day: 10
    }
  ];

  describe('calculateYearlyStatistics', () => {
    it('should calculate yearly statistics with working day counts', () => {
      const yearlyStats = calculateYearlyStatistics(testReleases);

      expect(yearlyStats).toHaveLength(1); // All releases are in 2023
      expect(yearlyStats[0].repository).toBe('test-repo');
      expect(yearlyStats[0].year).toBe(2023);
      expect(yearlyStats[0].release_count).toBe(4); // Total 4 releases
      expect(yearlyStats[0].working_day_count).toBe(3); // 3 releases on working days
    });
  });

  describe('calculateMonthlyStatistics', () => {
    it('should calculate monthly statistics with working day counts', () => {
      const monthlyStats = calculateMonthlyStatistics(testReleases);

      expect(monthlyStats).toHaveLength(1); // All releases are in July 2023
      expect(monthlyStats[0].repository).toBe('test-repo');
      expect(monthlyStats[0].year).toBe(2023);
      expect(monthlyStats[0].month).toBe(7);
      expect(monthlyStats[0].release_count).toBe(4); // Total 4 releases
      expect(monthlyStats[0].working_day_count).toBe(3); // 3 releases on working days
    });
  });

  describe('calculateWeeklyStatistics', () => {
    it('should calculate weekly statistics with working day counts', () => {
      const weeklyStats = calculateWeeklyStatistics(testReleases);

      expect(weeklyStats).toHaveLength(2); // Releases in weeks 27 and 28

      // Week 27 (3 releases, 2 on working days)
      const week27 = weeklyStats.find(stat => stat.week === 27);
      expect(week27).toBeDefined();
      expect(week27?.repository).toBe('test-repo');
      expect(week27?.year).toBe(2023);
      expect(week27?.release_count).toBe(3);
      expect(week27?.working_day_count).toBe(2);

      // Week 28 (1 release on working day)
      const week28 = weeklyStats.find(stat => stat.week === 28);
      expect(week28).toBeDefined();
      expect(week28?.repository).toBe('test-repo');
      expect(week28?.year).toBe(2023);
      expect(week28?.release_count).toBe(1);
      expect(week28?.working_day_count).toBe(1);
    });
  });

  describe('calculateDailyStatistics', () => {
    it('should calculate daily statistics with working day flags', () => {
      const dailyStats = calculateDailyStatistics(testReleases);

      expect(dailyStats).toHaveLength(4); // 4 unique days with releases

      // Check working day flags
      const mondayJuly3 = dailyStats.find(stat => stat.date === '2023-07-03');
      expect(mondayJuly3).toBeDefined();
      expect(mondayJuly3?.is_working_day).toBe(true);

      const saturdayJuly8 = dailyStats.find(stat => stat.date === '2023-07-08');
      expect(saturdayJuly8).toBeDefined();
      expect(saturdayJuly8?.is_working_day).toBe(false);
    });
  });

  describe('calculateWorkingDaysBetweenReleases', () => {
    it('should calculate working days between consecutive releases', () => {
      const workingDaysBetweenReleases = calculateWorkingDaysBetweenReleases(testReleases);

      expect(workingDaysBetweenReleases).toHaveLength(3); // 3 intervals between 4 releases

      // v1.1.0 (Wednesday) is 3 working days after v1.0.0 (Monday) - inclusive count
      const firstInterval = workingDaysBetweenReleases.find(stat => stat.release_tag === 'v1.1.0');
      expect(firstInterval).toBeDefined();
      expect(firstInterval?.working_days_since_previous_release).toBe(3);

      // v1.3.0 (Monday) is 1 working day after v1.2.0 (Saturday)
      const thirdInterval = workingDaysBetweenReleases.find(stat => stat.release_tag === 'v1.3.0');
      expect(thirdInterval).toBeDefined();
      expect(thirdInterval?.working_days_since_previous_release).toBe(1);
    });
  });

  describe('calculateWorkingDayReleaseCount', () => {
    it('should count releases on working days', () => {
      const workingDayReleaseCount = calculateWorkingDayReleaseCount(testReleases);

      expect(workingDayReleaseCount).toBe(3); // 3 releases on working days
    });
  });

  describe('calculateAllStatistics', () => {
    it('should calculate all statistics including working day metrics', () => {
      const allStats = calculateAllStatistics(testReleases);

      expect(allStats.releaseCount).toBe(4); // Total 4 releases
      expect(allStats.workingDayReleaseCount).toBe(3); // 3 releases on working days

      // Check that all statistics are included
      expect(allStats.yearlyStats).toBeDefined();
      expect(allStats.monthlyStats).toBeDefined();
      expect(allStats.weeklyStats).toBeDefined();
      expect(allStats.dailyStats).toBeDefined();
      expect(allStats.workingDaysBetweenReleases).toBeDefined();

      // Check working day counts in yearly stats
      expect(allStats.yearlyStats[0].working_day_count).toBe(3);

      // Check working day counts in monthly stats
      expect(allStats.monthlyStats[0].working_day_count).toBe(3);

      // Check working day flags in daily stats
      const mondayJuly3 = allStats.dailyStats.find(stat => stat.date === '2023-07-03');
      expect(mondayJuly3?.is_working_day).toBe(true);

      const saturdayJuly8 = allStats.dailyStats.find(stat => stat.date === '2023-07-08');
      expect(saturdayJuly8?.is_working_day).toBe(false);
    });
  });
});
