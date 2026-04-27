import { FastifyInstance } from 'fastify'
import { createOrder, listOrders, getOrder, updateOrderStatus } from './orders.controller'

export async function ordersRoutes(app: FastifyInstance) {
  app.post('/orders', createOrder)
  app.get('/orders', listOrders)
  app.get('/orders/:id', getOrder)
  app.patch('/orders/:id/status', updateOrderStatus)
}