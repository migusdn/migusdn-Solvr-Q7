/**
 * Controller for CSV export functionality
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import * as fs from 'fs';
import exportService from '../services/exportService';
import { ExportRequestParams } from '../types/exportTypes';

/**
 * Starts a new dashboard CSV export
 * @param request Fastify request with export parameters
 * @param reply Fastify reply
 */
export async function startDashboardExport(
  request: FastifyRequest<{
    Body: ExportRequestParams
  }>, 
  reply: FastifyReply
) {
  try {
    const params = request.body;
    
    // Validate required parameters
    if (!params.timeframe) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'timeframe is required'
      });
    }
    
    if (!params.exportOptions) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'exportOptions is required'
      });
    }
    
    // Create export job
    const exportData = await exportService.createExportJob(params, params.exportOptions);
    
    return reply.code(200).send({
      success: true,
      data: exportData
    });
  } catch (error: any) {
    console.error('Error in startDashboardExport controller:', error.message);
    return reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

/**
 * Gets the status of an export job
 * @param request Fastify request with export ID
 * @param reply Fastify reply
 */
export async function getExportStatus(
  request: FastifyRequest<{
    Params: { exportId: string }
  }>, 
  reply: FastifyReply
) {
  try {
    const { exportId } = request.params;
    
    // Get export status
    const exportData = exportService.getExportStatus(exportId);
    
    if (!exportData) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: `Export job with ID ${exportId} not found`
      });
    }
    
    return reply.code(200).send({
      success: true,
      data: exportData
    });
  } catch (error: any) {
    console.error('Error in getExportStatus controller:', error.message);
    return reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

/**
 * Downloads an exported CSV file
 * @param request Fastify request with filename
 * @param reply Fastify reply
 */
export async function downloadExportFile(
  request: FastifyRequest<{
    Params: { filename: string }
  }>, 
  reply: FastifyReply
) {
  try {
    const { filename } = request.params;
    
    // Get file path
    const filePath = exportService.getExportFilePath(filename);
    
    if (!filePath) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: `File ${filename} not found`
      });
    }
    
    // Set headers for file download
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', `attachment; filename=${filename}`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    return reply.send(fileStream);
  } catch (error: any) {
    console.error('Error in downloadExportFile controller:', error.message);
    return reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

/**
 * Cleans up old export files
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function cleanupExportFiles(
  request: FastifyRequest, 
  reply: FastifyReply
) {
  try {
    // Default to 24 hours
    const maxAge = request.query?.maxAge ? parseInt(request.query.maxAge as string) : 24 * 60 * 60 * 1000;
    
    exportService.cleanupExportFiles(maxAge);
    
    return reply.code(200).send({
      success: true,
      message: 'Export files cleaned up successfully'
    });
  } catch (error: any) {
    console.error('Error in cleanupExportFiles controller:', error.message);
    return reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

export default {
  startDashboardExport,
  getExportStatus,
  downloadExportFile,
  cleanupExportFiles
};