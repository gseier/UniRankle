import type { Request, Response } from 'express'
import { PrismaClient, RankingBy } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: Request, res: Response) {
  const today = new Date().toISOString().slice(0, 10)

  // Check if today's game already exists
  const existing = await prisma.dailyGame.findUnique({
    where: { dateKey: today },
    include: {
      entries: {
        include: { university: true },
      },
    },
  })

  // If it exists, return it (with universities this time)
  if (existing && existing.entries.length > 0) {
    return res.json(existing)
  }

  // Otherwise, generate a new one
  const rankingBy =
    Math.random() > 0.5 ? RankingBy.RANKING : RankingBy.STUDENT_COUNT

  const universities = await prisma.university.findMany()
  const shuffled = universities.sort(() => 0.5 - Math.random()).slice(0, 5)

  const dailyGame = await prisma.dailyGame.create({
    data: {
      dateKey: today,
      rankingBy,
      entries: {
        create: shuffled.map((u, i) => ({
          universityId: u.id,
          orderIndex: i,
        })),
      },
    },
    include: {
      entries: { include: { university: true } }, // This is the key part
    },
  })

  res.json(dailyGame)
}
