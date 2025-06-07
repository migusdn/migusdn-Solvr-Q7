import { FastifyInstance } from 'fastify'
import { AppContext } from '../types/context'
import { createUserRoutes } from './userRoutes'
import healthRoutes from './healthRoutes'
import githubRoutes from './githubRoutes'
import csvRoutes from './csvRoutes'

// 모든 라우트 등록
export const createRoutes = (context: AppContext) => async (fastify: FastifyInstance) => {
  // 헬스 체크 라우트
  fastify.register(healthRoutes, { prefix: '/api/health' })

  // 사용자 관련 라우트
  fastify.register(createUserRoutes(context), { prefix: '/api/users' })

  // GitHub 릴리즈 관련 라우트
  fastify.register(githubRoutes, { prefix: '/api/github' })

  // CSV 내보내기 관련 라우트
  fastify.register(csvRoutes, { prefix: '/api/csv' })
}
