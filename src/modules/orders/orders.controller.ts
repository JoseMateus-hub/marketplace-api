import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

export async function createOrder(req: FastifyRequest, reply: FastifyReply) {
  await req.jwtVerify()
  const { sub } = req.user as { sub: string }

  const schema = z.object({
    items: z.array(z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })).min(1),
  })

  const { items } = schema.parse(req.body)

  const products = await prisma.product.findMany({
    where: { id: { in: items.map(i => i.productId) }, isActive: true },
  })

  if (products.length !== items.length) {
    return reply.status(400).send({ message: 'Um ou mais produtos não encontrados.' })
  }

  for (const item of items) {
    const product = products.find(p => p.id === item.productId)!
    if (product.stock < item.quantity) {
      return reply.status(400).send({ message: `Estoque insuficiente para ${product.name}.` })
    }
  }

  const total = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)!
    return sum + product.price * item.quantity
  }, 0)

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId: sub,
        total,
        items: {
          create: items.map(item => {
            const product = products.find(p => p.id === item.productId)!
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
            }
          }),
        },
      },
      include: { items: { include: { product: true } } },
    })

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    const pixCode = `PIX-${newOrder.id.slice(0, 8).toUpperCase()}-${Date.now()}`
    await tx.payment.create({
      data: {
        orderId: newOrder.id,
        amount: total,
        pixCode,
      },
    })

    return newOrder
  })

  return reply.status(201).send({ order })
}

export async function listOrders(req: FastifyRequest, reply: FastifyReply) {
  await req.jwtVerify()
  const { sub } = req.user as { sub: string }

  const orders = await prisma.order.findMany({
    where: { userId: sub },
    include: {
      items: {
        include: {
          product: { select: { name: true, images: true, price: true } },
        },
      },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return reply.send({ orders })
}

export async function getOrder(req: FastifyRequest, reply: FastifyReply) {
  await req.jwtVerify()
  const { sub } = req.user as { sub: string }
  const { id } = req.params as { id: string }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { name: true, images: true, price: true, seller: { select: { storeName: true } } } },
        },
      },
      payment: true,
    },
  })

  if (!order || order.userId !== sub) {
    return reply.status(404).send({ message: 'Pedido não encontrado.' })
  }

  return reply.send({ order })
}

export async function updateOrderStatus(req: FastifyRequest, reply: FastifyReply) {
  await req.jwtVerify()
  const { id } = req.params as { id: string }

  const schema = z.object({
    status: z.enum(['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  })

  const { status } = schema.parse(req.body)

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  })

  return reply.send({ order })
}