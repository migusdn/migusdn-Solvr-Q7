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

export default {
  getAllReleases,
  fetchAndStoreReleases
};