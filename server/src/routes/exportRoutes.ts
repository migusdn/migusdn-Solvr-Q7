/**
 * Routes for CSV export functionality
 */

import { FastifyInstance } from 'fastify';
import exportController from '../controllers/exportController';

/**
 * Export routes
 * @param fastify Fastify instance
 */
async function exportRoutes(fastify: FastifyInstance) {
  // Start a new dashboard CSV export
  fastify.post('/dashboard-csv', exportController.startDashboardExport);
  
  // Get the status of an export job
  fastify.get('/status/:exportId', exportController.getExportStatus);
  
  // Download an exported CSV file
  fastify.get('/download/:filename', exportController.downloadExportFile);
  
  // Clean up old export files
  fastify.post('/cleanup', exportController.cleanupExportFiles);
}

export default exportRoutes;