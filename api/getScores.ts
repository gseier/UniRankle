import { PrismaClient } from '@prisma/client';
import type { IncomingMessage, ServerResponse } from 'http';

const prisma = new PrismaClient();

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    // Build full URL so we can safely access query params
    const base = `http://${req.headers.host ?? 'localhost'}`;
    const url = new URL(req.url ?? '/', base);

    // Read ?dateKey=YYYY-MM-DD from query string
    const dateKey = url.searchParams.get('dateKey');

    // Validate or fallback to UTC current date
    const targetDate =
      dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)
        ? dateKey
        : new Date().toISOString().slice(0, 10);

    // Fetch all scores for that date
    const scores = await prisma.gameScore.findMany({
      where: { dateKey: targetDate },
    });

    // Calculate average
    const total = scores.length;
    const avg =
      total > 0
        ? Math.round(
            (scores.reduce((sum, s) => sum + Number(s.score), 0) / total) * 10
          ) / 10
        : 0;

    // Respond with JSON
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ average: avg, total }));
  } catch (err) {
    console.error('getScores error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
}
