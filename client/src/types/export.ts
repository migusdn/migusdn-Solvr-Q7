/**
 * Export types
 */

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
export interface ExportRequestParams {
  timeframe: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
  filters?: {
    repository?: string[];
    releaseType?: string[];
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
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
 * Export response
 */
export interface ExportResponse {
  success: boolean;
  data: ExportData;
}

/**
 * Export status response
 */
export interface ExportStatusResponse {
  success: boolean;
  data: ExportData;
}