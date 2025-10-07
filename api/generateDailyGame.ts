import type { Request, Response } from 'express';
import { PrismaClient, RankingBy } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: Request, res: Response) {
  try {
    // 1️⃣ Determine the date to use (from query or fallback to UTC today)
    const { dateKey } = req.query as { dateKey?: string };
    const targetDate =
      typeof dateKey === 'string'
        ? dateKey
        : new Date().toISOString().slice(0, 10); // default to UTC date

    // 2️⃣ Try to find the daily game for that date
    let dailyGame = await prisma.dailyGame.findUnique({
      where: { dateKey: targetDate },
      include: {
        entries: { include: { university: true } },
      },
    });

    // 3️⃣ If not found, create one (cron handles this daily)
    if (!dailyGame || dailyGame.entries.length === 0) {
      const rankingBy =
        Math.random() > 0.5 ? RankingBy.RANKING : RankingBy.STUDENT_COUNT;

      const universities = await prisma.university.findMany();
      const shuffled = universities.sort(() => 0.5 - Math.random()).slice(0, 5);

      dailyGame = await prisma.dailyGame.upsert({
        where: { dateKey: targetDate },
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
          dateKey: targetDate,
          rankingBy,
          entries: {
            create: shuffled.map((u, i) => ({
              universityId: u.id,
              orderIndex: i,
            })),
          },
        },
        include: {
          entries: { include: { university: true } },
        },
      });
    }

    // 4️⃣ Return the requested (or newly created) game
    res.status(200).json(dailyGame);
  } catch (err) {
    console.error('generateDailyGame error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
