/**
 * Types for CSV export functionality
 */

import { DashboardFilterParams } from './dashboardTypes';

/**
 * Export options
 */
export interface ExportOptions {
  includeTimeSeriesData: boolean;
  includeRepositoryBreakdown: boolean;
  includeReleaseTypeBreakdown: boolean;
}

/**
 * Export request parameters
 */
export interface ExportRequestParams extends DashboardFilterParams {
  exportOptions: ExportOptions;
}

/**
 * Export status
 */
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Export data
 */
export interface ExportData {
  exportId: string;
  status: ExportStatus;
  progress?: number;
  estimatedTimeRemaining?: number;
  downloadUrl?: string;
  error?: string;
}

/**
 * Export job
 */
export interface ExportJob {
  id: string;
  status: ExportStatus;
  params: ExportRequestParams;
  progress: number;
  startTime: number;
  estimatedTimeRemaining?: number;
  downloadUrl?: string;
  error?: string;
}