import { FastifyRequest, FastifyReply } from 'fastify';
import githubService from '../services/githubService';
import { ProcessedRelease } from '../types/githubTypes';

/**
 * Fetches all releases from configured repositories
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function getAllReleases(request: FastifyRequest, reply: FastifyReply) {
  try {
    const releases = await githubService.fetchAllReleases();
    return reply.code(200).send({
      success: true,
      data: releases
    });
  } catch (error: any) {
    console.error('Error in getAllReleases controller:', error.message);
    return reply.code(500).send({
      success: false,
      error: 'Failed to fetch releases',
      message: error.message
    });
  }
}

/**
 * Fetches releases and stores them in memory for further processing
 * This is used for the data processing and CSV export tasks
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function fetchAndStoreReleases(request: FastifyRequest, reply: FastifyReply) {
  try {
    // This would typically store the data in a database or file system
    // For simplicity, we'll just return the fetched data
    const releases = await githubService.fetchAllReleases();

    return reply.code(200).send({
      success: true,
      message: 'Releases fetched and stored successfully',
      count: releases.length
    });
  } catch (error: any) {
    console.error('Error in fetchAndStoreReleases controller:', error.message);
    return reply.code(500).send({
      success: false,
      error: 'Failed to fetch and store releases',
      message: error.message
    });
  }
}

/**
 * Fetches release statistics for a specific repository
 * @param request Fastify request with repository, startDate, and endDate query parameters
 * @param reply Fastify reply
 */
export async function getReleaseStats(
  request: FastifyRequest<{
    Querystring: {
      repository: string;
      startDate?: string;
      endDate?: string;
    }
  }>,
  reply: FastifyReply
) {
  try {
    const { repository, startDate, endDate } = request.query;

    if (!repository) {
      return reply.code(400).send({
        success: false,
        error: 'Missing required parameter',
        message: 'Repository parameter is required'
      });
    }

    // Format repository as 'owner/repo' if it doesn't already include a '/'
    const formattedRepo = repository.includes('/') ? repository : `daangn/${repository}`;

    const releaseStats = await githubService.fetchRepositoryReleaseStats(
      formattedRepo,
      startDate,
      endDate
    );

    return reply.code(200).send({
      success: true,
      data: releaseStats
    });
  } catch (error: any) {
    console.error('Error in getReleaseStats controller:', error.message);

    // Handle specific error cases
    if (error.message.includes('Invalid repository format')) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid parameter',
        message: error.message
      });
    }

    if (error.response && error.response.status === 404) {
      return reply.code(404).send({
        success: false,
        error: 'Not found',
        message: 'Repository not found'
      });
    }

    if (error.response && error.response.status === 401) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'GitHub API authentication error'
      });
    }

    if (error.response && error.response.status === 429) {
      return reply.code(429).send({
        success: false,
        error: 'Rate limit exceeded',
        message: 'GitHub API rate limit exceeded'
      });
    }

    return reply.code(500).send({
      success: false,
      error: 'Server error',
      message: 'Failed to fetch release statistics'
    });
  }
}

export default {
  getAllReleases,
  fetchAndStoreReleases,
  getReleaseStats
};
