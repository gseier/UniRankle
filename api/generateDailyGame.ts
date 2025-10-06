import { PrismaClient, RankingBy } from '@prisma/client'
const prisma = new PrismaClient()
import type { Request, Response } from 'express'

export default async function handler(req: Request, res: Response) {
  const today = new Date().toISOString().slice(0, 10)
  const existing = await prisma.dailyGame.findUnique({ where: { dateKey: today } })
  if (existing) return res.json(existing)

  const rankingBy = Math.random() > 0.5 ? RankingBy.RANKING : RankingBy.STUDENT_COUNT
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
    include: { entries: { include: { university: true } } },
  })
  res.json(dailyGame)
}
