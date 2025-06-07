import { FastifyInstance } from 'fastify';
import dashboardController from '../controllers/dashboardController';

/**
 * Dashboard routes
 * @param fastify Fastify instance
 */
async function dashboardRoutes(fastify: FastifyInstance) {
  // Get dashboard data
  fastify.get('/dashboard', dashboardController.getDashboardData);
  
  // Clear dashboard cache
  fastify.post('/dashboard/clear-cache', dashboardController.clearDashboardCache);
}

export default dashboardRoutes;