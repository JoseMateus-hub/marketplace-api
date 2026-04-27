import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

export async function createProduct(req: FastifyRequest, reply: FastifyReply) {
  await req.jwtVerify()
  const { sub } = req.user as { sub: string }

  const seller = await prisma.seller.findUnique({ where: { userId: sub } })
  if (!seller) {
    return reply.status(403).send({ message: 'Você precisa ter uma loja para cadastrar produtos.' })
  }

  const schema = z.object({
    name: z.string().min(2),
    description: z.string().min(10),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    categoryId: z.string().uuid(),
    images: z.array(z.string()).optional().default([]),
  })

  const data = schema.parse(req.body)

  const product = await prisma.product.create({
    data: { ...data, sellerId: seller.id },
  })

  return reply.status(201).send({ product })
}

export async function listProducts(req: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
  })

  const { page, limit, search, categoryId, minPrice, maxPrice } = schema.parse(req.query)

  const where: any = { isActive: true }
  if (search) where.name = { contains: search, mode: 'insensitive' }
  if (categoryId) where.categoryId = categoryId
  if (minPrice || maxPrice) where.price = { gte: minPrice, lte: maxPrice }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        seller: { select: { storeName: true, rating: true } },
        category: { select: { name: true, slug: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ])

  return reply.send({ products, total, page, pages: Math.ceil(total / limit) })
}

export async function getProduct(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, storeName: true, rating: true, logo: true } },
      category: { select: { name: true, slug: true } },
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!product) {
    return reply.status(404).send({ message: 'Produto não encontrado.' })
  }

  return reply.send({ product })
}

export async function updateProduct(req: FastifyRequest, reply: FastifyReply) {
  await req.jwtVerify()
  const { sub } = req.user as { sub: string }
  const { id } = req.params as { id: string }

  const seller = await prisma.seller.findUnique({ where: { userId: sub } })
  if (!seller) {
    return reply.status(403).send({ message: 'Acesso negado.' })
  }

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product || product.sellerId !== seller.id) {
    return reply.status(403).send({ message: 'Você não tem permissão para editar este produto.' })
  }

  const schema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    images: z.array(z.string()).optional(),
  })

  const data = schema.parse(req.body)

  const updated = await prisma.product.update({ where: { id }, data })

  return reply.send({ product: updated })
}

export async function deleteProduct(req: FastifyRequest, reply: FastifyReply) {
  await req.jwtVerify()
  const { sub } = req.user as { sub: string }
  const { id } = req.params as { id: string }

  const seller = await prisma.seller.findUnique({ where: { userId: sub } })
  if (!seller) {
    return reply.status(403).send({ message: 'Acesso negado.' })
  }

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product || product.sellerId !== seller.id) {
    return reply.status(403).send({ message: 'Você não tem permissão para deletar este produto.' })
  }

  await prisma.product.update({ where: { id }, data: { isActive: false } })

  return reply.status(204).send()
}