import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import { parse } from 'cookie'
import { randomUUID } from 'crypto'
import type { IncomingMessage, ServerResponse } from 'http'

declare global {
  var __prismaClient: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs> | undefined
}

const prisma: PrismaClient = global.__prismaClient ?? (global.__prismaClient = new PrismaClient())

type Req = IncomingMessage & { body?: unknown; headers: IncomingMessage['headers'] }
type Res = ServerResponse

function sendJSON(res: Res, status: number, payload: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

async function readBody(req: Req): Promise<unknown> {
  if (req.body) return req.body
  const contentType = String(req.headers['content-type'] ?? '')
  return await new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => { raw += chunk })
    req.on('end', () => {
      if (!raw) return resolve({})
      try {
        if (contentType.includes('application/json')) return resolve(JSON.parse(raw))
        return resolve(raw)
      } catch (err) {
        return reject(err)
      }
    })
    req.on('error', reject)
  })
}

export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method !== 'POST') {
    sendJSON(res, 405, { success: false, message: 'Method not allowed' })
    return
  }

  try {
    const body = await readBody(req)
    const score = typeof body === 'object' && body !== null ? (body as Record<string, unknown>)['score'] : undefined

    if (typeof score !== 'number') {
      sendJSON(res, 400, { success: false, message: 'Invalid score' })
      return
    }

    const rawCookie = (req.headers && (req.headers.cookie as string | undefined)) ?? ''
    const cookies = parse(rawCookie)
    let cookieId = cookies['uid']

    if (!cookieId) {
      cookieId = randomUUID()
      res.setHeader('Set-Cookie', `uid=${cookieId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`)
    }

    const dateKey = new Date().toISOString().slice(0, 10)

    const existing = await prisma.gameScore.findFirst({
      where: { cookieId, dateKey },
    })
    if (existing)
      return sendJSON(res, 200, {
        success: false,
        alreadyPlayed: true,
        previousScore: existing.score,
      })

    await prisma.gameScore.create({
      data: { cookieId, dateKey, score },
    })

    sendJSON(res, 200, { success: true })
  } catch (err) {
    console.error('saveScore error:', err)
    const message = err instanceof Error ? err.message : String(err)
    sendJSON(res, 500, { success: false, error: message })
  }
}