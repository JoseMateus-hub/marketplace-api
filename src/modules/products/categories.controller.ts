import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

export async function createCategory(req: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    icon: z.string().optional(),
  })

  const data = schema.parse(req.body)

  const category = await prisma.category.create({ data })

  return reply.status(201).send({ category })
}

export async function listCategories(req: FastifyRequest, reply: FastifyReply) {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })

  return reply.send({ categories })
}