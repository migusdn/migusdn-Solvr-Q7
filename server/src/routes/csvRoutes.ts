import { FastifyInstance } from 'fastify';
import csvController from '../controllers/csvController';

/**
 * CSV export routes
 * @param fastify Fastify instance
 */
async function csvRoutes(fastify: FastifyInstance) {
  // Generate all CSV files
  fastify.post('/generate-all', csvController.generateAllCsvFiles);
  
  // Generate a specific CSV file
  fastify.post('/generate/:type', csvController.generateCsvFile);
  
  // Get statistics
  fastify.get('/statistics', csvController.getStatistics);
}

export default csvRoutes;