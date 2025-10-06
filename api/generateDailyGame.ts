import type { Request, Response } from 'express'
import { PrismaClient, RankingBy } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: Request, res: Response) {
  const today = new Date().toISOString().slice(0, 10)

  // Always include the linked university objects
  let dailyGame = await prisma.dailyGame.findUnique({
    where: { dateKey: today },
    include: {
      entries: {
        include: { university: true },
      },
    },
  })

  // Create the game if missing
  if (!dailyGame || dailyGame.entries.length === 0) {
    const rankingBy =
      Math.random() > 0.5 ? RankingBy.RANKING : RankingBy.STUDENT_COUNT
    const universities = await prisma.university.findMany()
    const shuffled = universities.sort(() => 0.5 - Math.random()).slice(0, 5)

    dailyGame = await prisma.dailyGame.upsert({
      where: { dateKey: today },
      update: {
        entries: {
          deleteMany: {}, // clear existing if any
          create: shuffled.map((u, i) => ({
            universityId: u.id,
            orderIndex: i,
          })),
        },
      },
      create: {
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
        entries: {
          include: { university: true },
        },
      },
    })
  }

  res.json(dailyGame)
}
