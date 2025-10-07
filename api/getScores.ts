// api/getScores.ts
import { PrismaClient } from '@prisma/client'
import type { IncomingMessage, ServerResponse } from 'http'

const prisma = new PrismaClient()

export default async function handler(
  _req: IncomingMessage,
  res: ServerResponse
) {
  const dateKey = new Date().toISOString().slice(0, 10)
  const scores = await prisma.gameScore.findMany({ where: { dateKey } })
  const avg = scores.length
    ? Math.round(
        (scores.reduce((a, b) => a + b.score, 0) / scores.length) * 10
      ) / 10
    : 0
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ average: avg, total: scores.length }))
}
