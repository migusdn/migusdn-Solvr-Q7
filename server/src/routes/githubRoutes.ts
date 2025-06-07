import { FastifyInstance } from 'fastify';
import githubController from '../controllers/githubController';

/**
 * GitHub API routes
 * @param fastify Fastify instance
 */
async function githubRoutes(fastify: FastifyInstance) {
  // Get all releases from configured repositories
  fastify.get('/releases', githubController.getAllReleases);
  
  // Fetch and store releases for further processing
  fastify.post('/releases/fetch', githubController.fetchAndStoreReleases);
}

export default githubRoutes;