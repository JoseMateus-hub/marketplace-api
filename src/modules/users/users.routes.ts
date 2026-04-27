import { FastifyInstance } from 'fastify'
import { registerUser, loginUser, getProfile } from './users.controller'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users/register', registerUser)
  app.post('/users/login', loginUser)
  app.get('/users/profile', getProfile)
}