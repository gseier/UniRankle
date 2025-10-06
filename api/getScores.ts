import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import type { Request, Response } from 'express'

export default async function handler(req: Request, res: Response) {
  const dateKey = new Date().toISOString().slice(0, 10)
  const scores = await prisma.gameScore.findMany({ where: { dateKey } })
  const avg = scores.length ? scores.reduce((a,b)=>a+b.score,0)/scores.length : 0
  res.json({ average: avg })
}
