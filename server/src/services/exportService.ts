/**
 * Service for exporting dashboard data to CSV
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createObjectCsvWriter } from 'csv-writer';
import { ProcessedRelease } from '../types/githubTypes';
import { DashboardFilterParams } from '../types/dashboardTypes';
import { ExportOptions, ExportJob, ExportStatus, ExportData } from '../types/exportTypes';
import dashboardService from './dashboardService';

// Directory for storing exported CSV files
const EXPORT_DIR = path.join(process.cwd(), 'data', 'exports');

// In-memory store for export jobs
const exportJobs = new Map<string, ExportJob>();

// Ensure export directory exists
function ensureExportDirExists() {
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }
}

/**
 * Creates a new export job
 * @param params Dashboard filter parameters
 * @param exportOptions Export options
 * @returns Export data
 */
export async function createExportJob(
  params: DashboardFilterParams,
  exportOptions: ExportOptions
): Promise<ExportData> {
  ensureExportDirExists();

  // Generate a unique ID for this export
  const exportId = uuidv4();

  // Create a new export job
  const job: ExportJob = {
    id: exportId,
    status: 'pending',
    params: { ...params, exportOptions },
    progress: 0,
    startTime: Date.now(),
    estimatedTimeRemaining: 30000 // Initial estimate: 30 seconds
  };

  // Store the job
  exportJobs.set(exportId, job);

  // Start processing the job in the background
  setTimeout(() => processExportJob(exportId), 0);

  // Return initial job status
  return {
    exportId,
    status: job.status,
    progress: job.progress,
    estimatedTimeRemaining: job.estimatedTimeRemaining
  };
}

/**
 * Processes an export job
 * @param exportId Export job ID
 */
async function processExportJob(exportId: string): Promise<void> {
  const job = exportJobs.get(exportId);
  if (!job) {
    console.error(`Export job ${exportId} not found`);
    return;
  }

  try {
    // Update job status
    job.status = 'processing';
    job.progress = 10;
    exportJobs.set(exportId, job);

    // Fetch releases
    const releases = await import('../services/githubService.js').then(
      module => module.default.fetchAllReleases()
    );

    job.progress = 30;
    exportJobs.set(exportId, job);

    // Generate dashboard data based on filters
    const dashboardData = dashboardService.generateDashboardData(releases, job.params);

    job.progress = 50;
    exportJobs.set(exportId, job);

    // Create CSV file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(EXPORT_DIR, `dashboard-export-${timestamp}.csv`);

    // Prepare data for CSV export
    const csvData: any[] = [];

    // Include time series data if requested
    if (job.params.exportOptions.includeTimeSeriesData) {
      dashboardData.timeSeriesData.forEach(item => {
        csvData.push({
          section: 'Time Series',
          date: item.date,
          releaseCount: item.releaseCount,
          commitCount: item.commitCount,
          contributorCount: item.contributorCount
        });
      });
    }

    job.progress = 70;
    exportJobs.set(exportId, job);

    // Include repository breakdown if requested
    if (job.params.exportOptions.includeRepositoryBreakdown) {
      dashboardData.topRepositories.forEach(item => {
        csvData.push({
          section: 'Repository Breakdown',
          repository: item.name,
          releaseCount: item.releaseCount,
          commitCount: item.commitCount
        });
      });
    }

    // Include release type breakdown if requested
    if (job.params.exportOptions.includeReleaseTypeBreakdown) {
      dashboardData.releaseTypeBreakdown.forEach(item => {
        csvData.push({
          section: 'Release Type Breakdown',
          type: item.type,
          count: item.count,
          percentage: item.percentage
        });
      });
    }

    job.progress = 80;
    exportJobs.set(exportId, job);

    // Write CSV file
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'section', title: 'Section' },
        { id: 'date', title: 'Date' },
        { id: 'repository', title: 'Repository' },
        { id: 'type', title: 'Type' },
        { id: 'releaseCount', title: 'Release Count' },
        { id: 'commitCount', title: 'Commit Count' },
        { id: 'contributorCount', title: 'Contributor Count' },
        { id: 'percentage', title: 'Percentage' }
      ]
    });

    await csvWriter.writeRecords(csvData);

    // Update job status to completed
    job.status = 'completed';
    job.progress = 100;
    job.estimatedTimeRemaining = 0;
    job.downloadUrl = `/api/v1/export/download/${path.basename(filePath)}`;
    exportJobs.set(exportId, job);

  } catch (error: any) {
    console.error(`Error processing export job ${exportId}:`, error.message);

    // Update job status to failed
    job.status = 'failed';
    job.error = error.message;
    exportJobs.set(exportId, job);
  }
}

/**
 * Gets the status of an export job
 * @param exportId Export job ID
 * @returns Export data
 */
export function getExportStatus(exportId: string): ExportData | null {
  const job = exportJobs.get(exportId);
  if (!job) {
    return null;
  }

  // Calculate estimated time remaining based on progress
  if (job.status === 'processing') {
    const elapsedTime = Date.now() - job.startTime;
    const estimatedTotalTime = (elapsedTime / job.progress) * 100;
    job.estimatedTimeRemaining = Math.max(0, estimatedTotalTime - elapsedTime);
  }

  return {
    exportId: job.id,
    status: job.status,
    progress: job.progress,
    estimatedTimeRemaining: job.estimatedTimeRemaining,
    downloadUrl: job.downloadUrl,
    error: job.error
  };
}

/**
 * Gets the file path for a download
 * @param filename Filename
 * @returns Full file path
 */
export function getExportFilePath(filename: string): string | null {
  const filePath = path.join(EXPORT_DIR, filename);

  // Check if file exists and is within the export directory
  if (
    fs.existsSync(filePath) && 
    filePath.startsWith(EXPORT_DIR) && 
    fs.statSync(filePath).isFile()
  ) {
    return filePath;
  }

  return null;
}

/**
 * Cleans up old export files
 * @param maxAgeMs Maximum age in milliseconds
 */
export function cleanupExportFiles(maxAgeMs = 24 * 60 * 60 * 1000): void {
  ensureExportDirExists();

  const now = Date.now();
  const files = fs.readdirSync(EXPORT_DIR);

  files.forEach(file => {
    const filePath = path.join(EXPORT_DIR, file);
    const stats = fs.statSync(filePath);

    if (now - stats.mtimeMs > maxAgeMs) {
      fs.unlinkSync(filePath);
    }
  });
}

export default {
  createExportJob,
  getExportStatus,
  getExportFilePath,
  cleanupExportFiles
};
