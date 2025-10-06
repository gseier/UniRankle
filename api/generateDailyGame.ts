import type { Request, Response } from 'express'
import { PrismaClient, RankingBy } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: Request, res: Response) {
  const today = new Date().toISOString().slice(0, 10)

  // 1. Fetch today's game with its entries
  let existing = await prisma.dailyGame.findUnique({
    where: { dateKey: today },
    include: { entries: { include: { university: true } } },
  })

  // 2. If it exists AND has entries, return it
  if (existing && existing.entries.length > 0) {
    return res.json(existing)
  }

  // 3. Otherwise create or fill it
  const rankingBy =
    existing?.rankingBy ??
    (Math.random() > 0.5 ? RankingBy.RANKING : RankingBy.STUDENT_COUNT)

  const universities = await prisma.university.findMany()
  const shuffled = universities.sort(() => 0.5 - Math.random()).slice(0, 5)

  // If the game exists but has no entries, fill them
  if (existing) {
    await prisma.dailyGameUniversity.createMany({
      data: shuffled.map((u, i) => ({
        dailyGameId: existing!.id,
        universityId: u.id,
        orderIndex: i,
      })),
    })
  } else {
    existing = await prisma.dailyGame.create({
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
  }

  // 4. Return updated game (with included universities)
  const fullGame = await prisma.dailyGame.findUnique({
    where: { dateKey: today },
    include: { entries: { include: { university: true } } },
  })

  res.json(fullGame)
}
