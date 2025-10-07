import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '@prisma/client'
import { parse } from 'cookie'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // Parse cookies safely
    const cookies = parse(req.headers.cookie || '')
    let cookieId = cookies['uid']

    if (!cookieId) {
      cookieId = randomUUID()
      res.setHeader(
        'Set-Cookie',
        `uid=${cookieId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`
      )
    }

    // Parse body correctly (Vercel auto-parses JSON)
    interface RequestBody {
      score: number;
    }

    const body: RequestBody = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    const score = body.score;

    if (typeof score !== 'number') {
      return res.status(400).json({ success: false, message: 'Invalid score' })
    }

    const dateKey = new Date().toISOString().slice(0, 10)

    await prisma.gameScore.create({
      data: { cookieId, dateKey, score },
    })

    return res.status(200).json({ success: true })
  } catch (err: unknown) {
    console.error('saveScore error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ success: false, error: errorMessage })
  }
}
