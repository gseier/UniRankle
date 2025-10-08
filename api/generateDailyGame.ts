import type { Request, Response } from 'express';
import { PrismaClient, RankingBy } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: Request, res: Response) {
  try {
    // 1️⃣ Read query params
    const { dateKey, future } = req.query as { dateKey?: string; future?: string };

    // 2️⃣ Determine which date to target
    let targetDate: string;

    if (future === 'true') {
      // Used by cron: generate the *next day's* game
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      targetDate = tomorrow.toISOString().slice(0, 10);
    } else if (typeof dateKey === 'string') {
      // Used by frontend: get the user's local day
      targetDate = dateKey;
    } else {
      // Fallback: use current UTC day
      targetDate = new Date().toISOString().slice(0, 10);
    }

    // 3️⃣ Try to find existing game for that date
    let dailyGame = await prisma.dailyGame.findUnique({
      where: { dateKey: targetDate },
      include: {
        entries: { include: { university: true } },
      },
    });

    // 4️⃣ If missing, create a new one
    if (!dailyGame || dailyGame.entries.length === 0) {
      const rankingBy =
        Math.random() > 0.5 ? RankingBy.RANKING : RankingBy.STUDENT_COUNT;

      const universities = await prisma.university.findMany();
      const shuffled = universities.sort(() => 0.5 - Math.random()).slice(0, 5);

      dailyGame = await prisma.dailyGame.upsert({
        where: { dateKey: targetDate },
        update: {
          entries: {
            deleteMany: {}, // clear old entries
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

    // 5️⃣ Return the requested (or newly created) game
    res.status(200).json(dailyGame);
  } catch (err) {
    console.error('generateDailyGame error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
