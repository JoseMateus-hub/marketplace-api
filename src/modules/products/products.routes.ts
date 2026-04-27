import { FastifyInstance } from 'fastify'
import { createProduct, listProducts, getProduct, updateProduct, deleteProduct } from './products.controller'
import { createCategory, listCategories } from './categories.controller'

export async function productsRoutes(app: FastifyInstance) {
  app.get('/products', listProducts)
  app.get('/products/:id', getProduct)
  app.post('/products', createProduct)
  app.put('/products/:id', updateProduct)
  app.delete('/products/:id', deleteProduct)

  app.get('/categories', listCategories)
  app.post('/categories', createCategory)
}