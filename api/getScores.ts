import { PrismaClient } from '@prisma/client';
import type { IncomingMessage, ServerResponse } from 'http';
const prisma = new PrismaClient();

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const base = `http://${req.headers.host ?? 'localhost'}`;
    const url = new URL(req.url ?? '/', base);

    const dateKey = url.searchParams.get('dateKey');
    const targetDate =
      dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)
        ? dateKey
        : new Date().toISOString().slice(0, 10);

    const scores = await prisma.gameScore.findMany({
      where: { dateKey: targetDate },
    });

    const total = scores.length;
    const avg =
      total > 0
        ? Math.round(
            (scores.reduce((sum, s) => sum + Number(s.score), 0) / total) * 10
          ) / 10
        : 0;
        
    // Calculate score distribution
    const distributionMap = new Map<number, number>();
    for (let i = 0; i <= 5; i++) { // Scores are 0-5
      distributionMap.set(i, 0);
    }
    scores.forEach(s => {
      if (s.score >= 0 && s.score <= 5) {
        distributionMap.set(s.score, (distributionMap.get(s.score) || 0) + 1);
      }
    });
    
    const distribution = Array.from(distributionMap.entries()).map(([score, count]) => ({
      name: score.toString(), // Label for the chart
      count,
    }));

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ average: avg, total, distribution }));
  } catch (err) {
    console.error('getScores error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
}