import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

export async function createReview(req: FastifyRequest, reply: FastifyReply) {
  await req.jwtVerify()
  const { sub } = req.user as { sub: string }
  const { productId } = req.params as { productId: string }

  const schema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  })

  const { rating, comment } = schema.parse(req.body)

  const purchasedProduct = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId: sub, status: 'DELIVERED' },
    },
  })

  if (!purchasedProduct) {
    return reply.status(403).send({ message: 'Você só pode avaliar produtos que comprou e recebeu.' })
  }

  const alreadyReviewed = await prisma.review.findFirst({
    where: { userId: sub, productId },
  })

  if (alreadyReviewed) {
    return reply.status(409).send({ message: 'Você já avaliou este produto.' })
  }

  const review = await prisma.review.create({
    data: { userId: sub, productId, rating, comment },
    include: { user: { select: { name: true, avatar: true } } },
  })

  const reviews = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
  })

  await prisma.product.update({
    where: { id: productId },
    data: { rating: reviews._avg.rating ?? 0 },
  })

  return reply.status(201).send({ review })
}

export async function listReviews(req: FastifyRequest, reply: FastifyReply) {
  const { productId } = req.params as { productId: string }

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const stats = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  })

  return reply.send({
    reviews,
    stats: {
      average: stats._avg.rating ?? 0,
      total: stats._count.rating,
    },
  })
}