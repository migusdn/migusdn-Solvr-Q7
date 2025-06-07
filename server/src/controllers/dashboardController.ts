import { FastifyRequest, FastifyReply } from 'fastify';
import githubService from '../services/githubService';
import dashboardService from '../services/dashboardService';
import { DashboardFilterParams } from '../types/dashboardTypes';

/**
 * Gets dashboard data based on filter parameters
 * @param request Fastify request with query parameters
 * @param reply Fastify reply
 */
export async function getDashboardData(
  request: FastifyRequest<{
    Querystring: DashboardFilterParams
  }>, 
  reply: FastifyReply
) {
  try {
    const params = request.query;
    
    // Set default timeframe if not provided
    if (!params.timeframe) {
      params.timeframe = 'daily';
    }
    
    // Fetch all releases
    const releases = await githubService.fetchAllReleases();
    
    // Generate dashboard data
    const dashboardData = dashboardService.getDashboardData(releases, params);
    
    return reply.code(200).send({
      success: true,
      data: dashboardData
    });
  } catch (error: any) {
    console.error('Error in getDashboardData controller:', error.message);
    return reply.code(500).send({
      success: false,
      error: 'Failed to get dashboard data',
      message: error.message
    });
  }
}

/**
 * Clears the dashboard data cache
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function clearDashboardCache(
  request: FastifyRequest, 
  reply: FastifyReply
) {
  try {
    dashboardService.clearDashboardCache();
    
    return reply.code(200).send({
      success: true,
      message: 'Dashboard cache cleared successfully'
    });
  } catch (error: any) {
    console.error('Error in clearDashboardCache controller:', error.message);
    return reply.code(500).send({
      success: false,
      error: 'Failed to clear dashboard cache',
      message: error.message
    });
  }
}

export default {
  getDashboardData,
  clearDashboardCache
};