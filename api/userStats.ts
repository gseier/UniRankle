// api/userStats.ts
import { PrismaClient } from '@prisma/client'
import { parse } from 'cookie'

const prisma = new PrismaClient()

import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookies = parse(req.headers.cookie || '')
    const cookieId = cookies['uid']
    if (!cookieId) return res.json({ totalGames: 0, avgScore: null, distribution: [] })

    const scores = await prisma.gameScore.findMany({
      where: { cookieId },
      orderBy: { createdAt: 'desc' },
    })

    if (!scores.length) return res.json({ totalGames: 0, avgScore: null, distribution: [] })

    const total = scores.length
    const sum = scores.reduce((acc, s) => acc + Number(s.score), 0)
    const avg = total > 0 ? parseFloat((sum / total).toFixed(1)) : 0

    // Calculate user's all-time score distribution
    const distributionMap = new Map<number, number>();
    for (let i = 0; i <= 5; i++) {
        distributionMap.set(i, 0);
    }
    scores.forEach(s => {
      if (s.score >= 0 && s.score <= 5) {
        distributionMap.set(s.score, (distributionMap.get(s.score) || 0) + 1);
      }
    });

    const distribution = Array.from(distributionMap.entries()).map(([score, count]) => ({
      name: score.toString(),
      count,
    }));

    res.json({ totalGames: scores.length, avgScore: avg, distribution })
  } catch (err: unknown) {
    console.error('userStats error:', err)
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: 'An unknown error occurred' })
    }
  }
}