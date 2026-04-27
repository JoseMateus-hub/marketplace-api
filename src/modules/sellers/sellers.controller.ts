import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

export async function createSeller(req: FastifyRequest, reply: FastifyReply) {
  await req.jwtVerify()
  const { sub } = req.user as { sub: string }

  const schema = z.object({
    storeName: z.string().min(2),
    description: z.string().optional(),
  })

  const { storeName, description } = schema.parse(req.body)

  const alreadySeller = await prisma.seller.findUnique({ where: { userId: sub } })
  if (alreadySeller) {
    return reply.status(409).send({ message: 'Você já possui uma loja.' })
  }

  const seller = await prisma.seller.create({
    data: { storeName, description, userId: sub },
  })

  await prisma.user.update({
    where: { id: sub },
    data: { role: 'SELLER' },
  })

  return reply.status(201).send({ seller })
}

export async function getSellerProfile(req: FastifyRequest, reply: FastifyReply) {
  await req.jwtVerify()
  const { sub } = req.user as { sub: string }

  const seller = await prisma.seller.findUnique({
    where: { userId: sub },
    include: {
      products: {
        where: { isActive: true },
        take: 10,
      },
    },
  })

  if (!seller) {
    return reply.status(404).send({ message: 'Loja não encontrada.' })
  }

  return reply.send({ seller })
}

export async function listSellers(req: FastifyRequest, reply: FastifyReply) {
  const sellers = await prisma.seller.findMany({
    where: { isActive: true },
    select: {
      id: true,
      storeName: true,
      description: true,
      logo: true,
      rating: true,
      _count: { select: { products: true } },
    },
    orderBy: { rating: 'desc' },
  })

  return reply.send({ sellers })
}