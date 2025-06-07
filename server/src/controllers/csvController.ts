import { FastifyRequest, FastifyReply } from 'fastify';
import githubService from '../services/githubService';
import csvService from '../services/csvService';
import statisticsService from '../services/statisticsService';

/**
 * Generates all CSV files from GitHub release data
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function generateAllCsvFiles(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Fetch all releases
    const releases = await githubService.fetchAllReleases();
    
    // Generate all CSV files
    const csvFiles = await csvService.generateAllCsvFiles(releases);
    
    return reply.code(200).send({
      success: true,
      message: 'CSV files generated successfully',
      files: csvFiles
    });
  } catch (error: any) {
    console.error('Error in generateAllCsvFiles controller:', error.message);
    return reply.code(500).send({
      success: false,
      error: 'Failed to generate CSV files',
      message: error.message
    });
  }
}

/**
 * Generates a specific CSV file from GitHub release data
 * @param request Fastify request with params.type
 * @param reply Fastify reply
 */
export async function generateCsvFile(request: FastifyRequest<{
  Params: { type: string }
}>, reply: FastifyReply) {
  try {
    const { type } = request.params;
    
    // Fetch all releases
    const releases = await githubService.fetchAllReleases();
    
    let filePath: string;
    
    // Generate the requested CSV file
    switch (type) {
      case 'all-releases':
        filePath = await csvService.generateAllReleasesCsv(releases);
        break;
      case 'yearly-statistics':
        filePath = await csvService.generateYearlyStatisticsCsv(releases);
        break;
      case 'monthly-statistics':
        filePath = await csvService.generateMonthlyStatisticsCsv(releases);
        break;
      case 'weekly-statistics':
        filePath = await csvService.generateWeeklyStatisticsCsv(releases);
        break;
      case 'daily-statistics':
        filePath = await csvService.generateDailyStatisticsCsv(releases);
        break;
      case 'comparison-statistics':
        filePath = await csvService.generateComparisonStatisticsCsv(releases);
        break;
      default:
        return reply.code(400).send({
          success: false,
          error: 'Invalid CSV type',
          message: `Type '${type}' is not supported`
        });
    }
    
    return reply.code(200).send({
      success: true,
      message: `CSV file '${type}' generated successfully`,
      file: filePath
    });
  } catch (error: any) {
    console.error('Error in generateCsvFile controller:', error.message);
    return reply.code(500).send({
      success: false,
      error: 'Failed to generate CSV file',
      message: error.message
    });
  }
}

/**
 * Gets statistics from GitHub release data
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function getStatistics(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Fetch all releases
    const releases = await githubService.fetchAllReleases();
    
    // Calculate all statistics
    const statistics = statisticsService.calculateAllStatistics(releases);
    
    return reply.code(200).send({
      success: true,
      data: statistics
    });
  } catch (error: any) {
    console.error('Error in getStatistics controller:', error.message);
    return reply.code(500).send({
      success: false,
      error: 'Failed to get statistics',
      message: error.message
    });
  }
}

export default {
  generateAllCsvFiles,
  generateCsvFile,
  getStatistics
};