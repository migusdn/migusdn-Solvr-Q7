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
  request: FastifyRequest, 
  reply: FastifyReply
) {
  try {
    // 직렬화된 쿼리 파라미터 처리
    const rawParams = request.query as Record<string, any>;

    // filters와 sort가 JSON 문자열로 전달되었다면 파싱
    let filtersObj = {};
    if (rawParams.filters && typeof rawParams.filters === 'string') {
      try {
        filtersObj = JSON.parse(rawParams.filters);
      } catch (e) {
        console.error('Failed to parse filters JSON:', e);
      }
    }

    let sortObj = undefined;
    if (rawParams.sort && typeof rawParams.sort === 'string') {
      try {
        sortObj = JSON.parse(rawParams.sort);
      } catch (e) {
        console.error('Failed to parse sort JSON:', e);
      }
    }

    // 파싱된 데이터로 params 객체 생성
    const params: DashboardFilterParams = {
      timeframe: rawParams.timeframe as 'daily' | 'weekly' | 'monthly',
      startDate: rawParams.startDate,
      endDate: rawParams.endDate,
      filters: filtersObj as any,
      sort: sortObj
    };


    // Set default timeframe if not provided
    if (!params.timeframe) {
      params.timeframe = 'daily';
    }

    // 필터가 undefined인 경우 빈 객체로 초기화
    if (!params.filters) {
      params.filters = {};
    }
    if(!params.filters.repository) {
      params.filters.repository = ['daangn/stackflow', 'daangn/seed-design'];
    }

    // Fetch all releases
    const releases = await githubService.fetchAllReleases();

    // Generate dashboard data (now async)
    const dashboardData = await dashboardService.getDashboardData(releases, params);

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
