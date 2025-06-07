import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { ProcessedRelease } from '../types/githubTypes';
import {
  YearlyStatistic,
  MonthlyStatistic,
  WeeklyStatistic,
  DailyStatistic,
  ComparisonStatistic,
  WorkingDaysBetweenReleasesStatistic,
  calculateYearlyStatistics,
  calculateMonthlyStatistics,
  calculateWeeklyStatistics,
  calculateDailyStatistics,
  calculateComparisonStatistics,
  calculateWorkingDaysBetweenReleases,
  calculateWorkingDayReleaseCount
} from './statisticsService';
import { isWorkingDay, parseISODate } from '../utils/dateUtils'

// Define the output directory for CSV files
const CSV_OUTPUT_DIR = path.join(process.cwd(), 'data', 'csv');

/**
 * Ensures the CSV output directory exists
 */
function ensureOutputDirExists() {
  if (!fs.existsSync(CSV_OUTPUT_DIR)) {
    fs.mkdirSync(CSV_OUTPUT_DIR, { recursive: true });
  }
}

/**
 * Generates a CSV file with all releases
 * @param releases Processed release data
 * @returns Path to the generated CSV file
 */
export async function generateAllReleasesCsv(releases: ProcessedRelease[]): Promise<string> {
  ensureOutputDirExists();

  const filePath = path.join(CSV_OUTPUT_DIR, 'all_releases.csv');

  // Process releases to add working day flag
  const processedReleases = releases.map(release => {
    const releaseDate = parseISODate(release.published_at);
    const isWorkDay = isWorkingDay(releaseDate);
    return {
      ...release,
      is_working_day: isWorkDay
    };
  });

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'repository', title: 'repository' },
      { id: 'tag_name', title: 'tag_name' },
      { id: 'name', title: 'name' },
      { id: 'published_at', title: 'published_at' },
      { id: 'created_at', title: 'created_at' },
      { id: 'author', title: 'author' },
      { id: 'is_working_day', title: 'is_working_day' }
    ]
  });

  await csvWriter.writeRecords(processedReleases);

  return filePath;
}

/**
 * Generates a CSV file with yearly statistics
 * @param releases Processed release data
 * @returns Path to the generated CSV file
 */
export async function generateYearlyStatisticsCsv(releases: ProcessedRelease[]): Promise<string> {
  ensureOutputDirExists();

  const yearlyStats = calculateYearlyStatistics(releases);
  const filePath = path.join(CSV_OUTPUT_DIR, 'yearly_statistics.csv');

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'repository', title: 'repository' },
      { id: 'year', title: 'year' },
      { id: 'release_count', title: 'release_count' },
      { id: 'working_day_count', title: 'working_day_count' }
    ]
  });

  await csvWriter.writeRecords(yearlyStats);

  return filePath;
}

/**
 * Generates a CSV file with monthly statistics
 * @param releases Processed release data
 * @returns Path to the generated CSV file
 */
export async function generateMonthlyStatisticsCsv(releases: ProcessedRelease[]): Promise<string> {
  ensureOutputDirExists();

  const monthlyStats = calculateMonthlyStatistics(releases);
  const filePath = path.join(CSV_OUTPUT_DIR, 'monthly_statistics.csv');

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'repository', title: 'repository' },
      { id: 'year', title: 'year' },
      { id: 'month', title: 'month' },
      { id: 'release_count', title: 'release_count' },
      { id: 'working_day_count', title: 'working_day_count' }
    ]
  });

  await csvWriter.writeRecords(monthlyStats);

  return filePath;
}

/**
 * Generates a CSV file with weekly statistics
 * @param releases Processed release data
 * @returns Path to the generated CSV file
 */
export async function generateWeeklyStatisticsCsv(releases: ProcessedRelease[]): Promise<string> {
  ensureOutputDirExists();

  const weeklyStats = calculateWeeklyStatistics(releases);
  const filePath = path.join(CSV_OUTPUT_DIR, 'weekly_statistics.csv');

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'repository', title: 'repository' },
      { id: 'year', title: 'year' },
      { id: 'week', title: 'week' },
      { id: 'release_count', title: 'release_count' },
      { id: 'working_day_count', title: 'working_day_count' }
    ]
  });

  await csvWriter.writeRecords(weeklyStats);

  return filePath;
}

/**
 * Generates a CSV file with daily statistics
 * @param releases Processed release data
 * @returns Path to the generated CSV file
 */
export async function generateDailyStatisticsCsv(releases: ProcessedRelease[]): Promise<string> {
  ensureOutputDirExists();

  const dailyStats = calculateDailyStatistics(releases);
  const filePath = path.join(CSV_OUTPUT_DIR, 'daily_statistics.csv');

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'repository', title: 'repository' },
      { id: 'date', title: 'date' },
      { id: 'release_count', title: 'release_count' },
      { id: 'is_working_day', title: 'is_working_day' }
    ]
  });

  await csvWriter.writeRecords(dailyStats);

  return filePath;
}

/**
 * Generates a CSV file with comparison statistics
 * @param releases Processed release data
 * @returns Path to the generated CSV file
 */
export async function generateComparisonStatisticsCsv(releases: ProcessedRelease[]): Promise<string> {
  ensureOutputDirExists();

  const comparisonStats = calculateComparisonStatistics(releases);
  const filePath = path.join(CSV_OUTPUT_DIR, 'comparison_statistics.csv');

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'metric', title: 'metric' },
      { id: 'stackflow_value', title: 'stackflow_value' },
      { id: 'seed_design_value', title: 'seed_design_value' },
      { id: 'difference', title: 'difference' },
      { id: 'percentage_difference', title: 'percentage_difference' }
    ]
  });

  await csvWriter.writeRecords(comparisonStats);

  return filePath;
}

/**
 * Generates a CSV file with working days between releases statistics
 * @param releases Processed release data
 * @returns Path to the generated CSV file
 */
export async function generateWorkingDaysBetweenReleasesCsv(releases: ProcessedRelease[]): Promise<string> {
  ensureOutputDirExists();

  const workingDaysBetweenReleases = calculateWorkingDaysBetweenReleases(releases);
  const filePath = path.join(CSV_OUTPUT_DIR, 'working_days_between_releases.csv');

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'repository', title: 'repository' },
      { id: 'release_tag', title: 'release_tag' },
      { id: 'working_days_since_previous_release', title: 'working_days_since_previous_release' }
    ]
  });

  await csvWriter.writeRecords(workingDaysBetweenReleases);

  return filePath;
}

/**
 * Generates all CSV files from the processed release data
 * @param releases Processed release data
 * @returns Object with paths to all generated CSV files
 */
export async function generateAllCsvFiles(releases: ProcessedRelease[]): Promise<Record<string, string>> {
  const allReleasesCsvPath = await generateAllReleasesCsv(releases);
  const yearlyStatsCsvPath = await generateYearlyStatisticsCsv(releases);
  const monthlyStatsCsvPath = await generateMonthlyStatisticsCsv(releases);
  const weeklyStatsCsvPath = await generateWeeklyStatisticsCsv(releases);
  const dailyStatsCsvPath = await generateDailyStatisticsCsv(releases);
  const comparisonStatsCsvPath = await generateComparisonStatisticsCsv(releases);
  const workingDaysBetweenReleasesCsvPath = await generateWorkingDaysBetweenReleasesCsv(releases);

  return {
    allReleases: allReleasesCsvPath,
    yearlyStats: yearlyStatsCsvPath,
    monthlyStats: monthlyStatsCsvPath,
    weeklyStats: weeklyStatsCsvPath,
    dailyStats: dailyStatsCsvPath,
    comparisonStats: comparisonStatsCsvPath,
    workingDaysBetweenReleases: workingDaysBetweenReleasesCsvPath
  };
}

export default {
  generateAllReleasesCsv,
  generateYearlyStatisticsCsv,
  generateMonthlyStatisticsCsv,
  generateWeeklyStatisticsCsv,
  generateDailyStatisticsCsv,
  generateComparisonStatisticsCsv,
  generateWorkingDaysBetweenReleasesCsv,
  generateAllCsvFiles
};
