import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { env } from './env'
import { usersRoutes } from './modules/users/users.routes'
import { sellersRoutes } from './modules/sellers/sellers.routes'
import { productsRoutes } from './modules/products/products.routes'
import { ordersRoutes } from './modules/orders/orders.routes'
import { reviewsRoutes } from './modules/reviews/reviews.routes'

export const app = fastify({ logger: true })

app.register(cors, { origin: true })
app.register(jwt, { secret: env.JWT_SECRET })

app.get('/health', async () => {
  return { status: 'ok', message: 'Marketplace API running!' }
})

app.register(usersRoutes, { prefix: '/api' })
app.register(sellersRoutes, { prefix: '/api' })
app.register(productsRoutes, { prefix: '/api' })
app.register(ordersRoutes, { prefix: '/api' })
app.register(reviewsRoutes, { prefix: '/api' })