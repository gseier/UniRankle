import type { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { parse } from 'cookie'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

export default async function handler(req: Request, res: Response) {
  // Explicitly tell TS what the cookies object looks like
  const cookies = parse(req.headers.cookie || '') as Record<string, string>

  let cookieId: string | undefined = cookies['uid']

  // Create cookie if not present
  if (!cookieId) {
    cookieId = randomUUID()
    res.setHeader(
      'Set-Cookie',
      `uid=${cookieId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`
    )
  }

  // Safely parse the score from body
  const { score } =
    typeof req.body === 'string' ? JSON.parse(req.body) : req.body

  const dateKey = new Date().toISOString().slice(0, 10)

  await prisma.gameScore.create({
    data: { cookieId, dateKey, score },
  })

  res.status(200).json({ success: true })
}
