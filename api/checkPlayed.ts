// api/checkPlayed.ts
import { PrismaClient } from '@prisma/client'
import { parse } from 'cookie'

const prisma = new PrismaClient()

import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookies = parse(req.headers.cookie || '')
    const cookieId = cookies['uid']
    const dateKey = new Date().toISOString().slice(0, 10)

    if (!cookieId) return res.json({ alreadyPlayed: false })

    const existing = await prisma.gameScore.findFirst({
      where: { cookieId, dateKey },
    })

    if (existing) {
      return res.json({
        alreadyPlayed: true,
        previousScore: existing.score,
      })
    }

    return res.json({ alreadyPlayed: false })
  } catch (err: unknown) {
    console.error('checkPlayed error:', err)
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: 'An unknown error occurred' })
    }
  }
}
