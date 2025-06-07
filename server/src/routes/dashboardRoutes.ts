import { FastifyInstance } from 'fastify';
import dashboardController from '../controllers/dashboardController';
import { DashboardFilterParams } from '../types/dashboardTypes';

/**
 * Dashboard routes
 * @param fastify Fastify instance
 */
async function dashboardRoutes(fastify: FastifyInstance) {
  // Get dashboard data
  fastify.get('/dashboard', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          timeframe: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          filters: { type: 'string' }, // JSON 문자열로 처리
          sort: { type: 'string' } // JSON 문자열로 처리
        }
      }
    },
    handler: dashboardController.getDashboardData
  });
  
  // Clear dashboard cache
  fastify.post('/dashboard/clear-cache', dashboardController.clearDashboardCache);
}

export default dashboardRoutes;