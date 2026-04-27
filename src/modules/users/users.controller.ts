import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function registerUser(req: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
  })

  const { name, email, password, phone } = schema.parse(req.body)

  const userExists = await prisma.user.findUnique({ where: { email } })
  if (userExists) {
    return reply.status(409).send({ message: 'Email já cadastrado.' })
  }

  const hashedPassword = await bcrypt.hash(password, 8)

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, phone },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return reply.status(201).send({ user })
}

export async function loginUser(req: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    email: z.string().email(),
    password: z.string(),
  })

  const { email, password } = schema.parse(req.body)

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return reply.status(401).send({ message: 'Email ou senha inválidos.' })
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    return reply.status(401).send({ message: 'Email ou senha inválidos.' })
  }

  const token = req.server.jwt.sign(
    { sub: user.id, role: user.role },
    { expiresIn: '7d' }
  )

  return reply.send({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
}

export async function getProfile(req: FastifyRequest, reply: FastifyReply) {
  await req.jwtVerify()
  const { sub } = req.user as { sub: string }

  const user = await prisma.user.findUnique({
    where: { id: sub },
    select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, createdAt: true },
  })

  if (!user) {
    return reply.status(404).send({ message: 'Usuário não encontrado.' })
  }

  return reply.send({ user })
}