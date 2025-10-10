// api/getScores.ts
import { PrismaClient } from '@prisma/client'
import type { IncomingMessage, ServerResponse } from 'http'

const prisma = new PrismaClient()

export default async function handler(
  _req: IncomingMessage,
  res: ServerResponse
) {
  const { dateKey } = new URL(_req.url || '', `http://${_req.headers.host}`).searchParams as unknown as { dateKey?: string }
    let targetDate: string;
    if (typeof dateKey === 'string') {
      // Used by frontend: get the user's local day
      targetDate = dateKey;
    } else {
      // Fallback: use current UTC day
      targetDate = new Date().toISOString().slice(0, 10);
    }
  const scores = await prisma.gameScore.findMany({ where: { dateKey: targetDate } })
  const avg = scores.length
    ? Math.round(
        (scores.reduce((a, b) => a + b.score, 0) / scores.length) * 10
      ) / 10
    : 0
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ average: avg, total: scores.length }))
}
