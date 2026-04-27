import { FastifyInstance } from 'fastify'
import { createSeller, getSellerProfile, listSellers } from './sellers.controller'

export async function sellersRoutes(app: FastifyInstance) {
  app.post('/sellers', createSeller)
  app.get('/sellers', listSellers)
  app.get('/sellers/me', getSellerProfile)
}