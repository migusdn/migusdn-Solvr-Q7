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
  calculateYearlyStatistics,
  calculateMonthlyStatistics,
  calculateWeeklyStatistics,
  calculateDailyStatistics,
  calculateComparisonStatistics
} from './statisticsService';

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
  
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'repository', title: 'repository' },
      { id: 'tag_name', title: 'tag_name' },
      { id: 'name', title: 'name' },
      { id: 'published_at', title: 'published_at' },
      { id: 'created_at', title: 'created_at' },
      { id: 'author', title: 'author' }
    ]
  });
  
  await csvWriter.writeRecords(releases.map(release => ({
    repository: release.repository,
    tag_name: release.tag_name,
    name: release.name,
    published_at: release.published_at,
    created_at: release.created_at,
    author: release.author
  })));
  
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
      { id: 'release_count', title: 'release_count' }
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
      { id: 'release_count', title: 'release_count' }
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
      { id: 'release_count', title: 'release_count' }
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
      { id: 'release_count', title: 'release_count' }
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
  
  return {
    allReleases: allReleasesCsvPath,
    yearlyStats: yearlyStatsCsvPath,
    monthlyStats: monthlyStatsCsvPath,
    weeklyStats: weeklyStatsCsvPath,
    dailyStats: dailyStatsCsvPath,
    comparisonStats: comparisonStatsCsvPath
  };
}

export default {
  generateAllReleasesCsv,
  generateYearlyStatisticsCsv,
  generateMonthlyStatisticsCsv,
  generateWeeklyStatisticsCsv,
  generateDailyStatisticsCsv,
  generateComparisonStatisticsCsv,
  generateAllCsvFiles
};