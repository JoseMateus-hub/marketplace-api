import { FastifyInstance } from 'fastify'
import { createReview, listReviews } from './reviews.controller'

export async function reviewsRoutes(app: FastifyInstance) {
  app.get('/products/:productId/reviews', listReviews)
  app.post('/products/:productId/reviews', createReview)
}