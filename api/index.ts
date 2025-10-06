import express from 'express';
import cookieParser from 'cookie-parser';
import { PrismaClient, RankingBy } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cookieParser());

// --- utils ---
const getUTCDateKey = (d = new Date()) => d.toISOString().slice(0, 10); // e.g., "2025-10-06"

// deterministic RNG from a string seed (for consistent daily picks)
function xorshift32(seedStr: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let x = h || 1;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17; x >>>= 0;
    x ^= x << 5;  x >>>= 0;
    return (x >>> 0) / 4294967296;
  };
}

async function ensureDailyGame(dateKey: string) {
  let game = await prisma.dailyGame.findUnique({
    where: { dateKey },
    include: {
      entries: {
        include: { university: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });
  if (game) return game;

  const rng = xorshift32(dateKey);
  const rankingBy: RankingBy = rng() < 0.5 ? 'RANKING' : 'STUDENT_COUNT';

  const all = await prisma.university.findMany({ orderBy: { id: 'asc' }, select: { id: true } });
  if (all.length < 5) throw new Error('Need at least 5 universities in DB');

  const picked = new Set<string>();
  while (picked.size < 5) {
    const idx = Math.floor(rng() * all.length);
    picked.add(all[idx].id);
  }
  const pickedIds = [...picked];

  game = await prisma.dailyGame.create({
    data: {
      dateKey,
      rankingBy,
      entries: {
        create: pickedIds.map((universityId, orderIndex) => ({ universityId, orderIndex })),
      },
    },
    include: {
      entries: {
        include: { university: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  return game;
}

function ensureUserIdCookie(req: express.Request, res: express.Response): string {
  let userId = req.cookies?.userId;
  if (!userId) {
    userId = randomUUID();
    res.cookie('userId', userId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });
  }
  return userId;
}

// --- routes ---
app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/daily', async (req, res) => {
  try {
    ensureUserIdCookie(req, res);
    const dateKey = getUTCDateKey(new Date());
    const game = await ensureDailyGame(dateKey);
    const universities = game.entries.map((e) => e.university);

    res.json({
      dateKey: game.dateKey,
      rankingBy: game.rankingBy, // 'RANKING' | 'STUDENT_COUNT'
      universities,
    });
  } catch (e: unknown) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'Server error';
    res.status(500).json({ error: errorMessage });
  }
});

app.post('/submissions', async (req, res) => {
  try {
    const userId = ensureUserIdCookie(req, res);
    const { dateKey, order }: { dateKey: string; order: string[] } = req.body;

    if (!dateKey || !Array.isArray(order) || order.length !== 5) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const game = await prisma.dailyGame.findUnique({
      where: { dateKey },
      include: {
        entries: { include: { university: true }, orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!game) return res.status(404).json({ error: 'Daily game not found' });

    const entries = game.entries.map((e) => e.university);
    const correctOrder = [...entries].sort((a, b) => {
      if (game.rankingBy === 'STUDENT_COUNT') return b.studentCount - a.studentCount;
      return a.ranking - b.ranking;
    });

    let score = 0;
    for (let i = 0; i < correctOrder.length; i++) {
      if (order[i] === correctOrder[i].id) score++;
    }

    await prisma.submission.upsert({
      where: { dailyGameId_userId: { dailyGameId: game.id, userId } },
      update: { score, finalOrder: order },
      create: { dailyGameId: game.id, userId, score, finalOrder: order },
    });

    const agg = await prisma.submission.aggregate({
      where: { dailyGameId: game.id },
      _avg: { score: true },
      _count: { _all: true },
    });

    const averageScore = Number(agg._avg.score?.toFixed(2) ?? 0);

    res.json({
      score,
      maxPossibleScore: 5,
      averageScore,
      submissionsCount: agg._count._all,
    });
  } catch (e: unknown) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'Server error';
    res.status(500).json({ error: errorMessage });
  }
});

app.get('/stats', async (req, res) => {
  try {
    const dateKey = (req.query.dateKey as string) || getUTCDateKey(new Date());
    const game = await prisma.dailyGame.findUnique({ where: { dateKey } });
    if (!game) return res.json({ averageScore: null, submissionsCount: 0 });

    const agg = await prisma.submission.aggregate({
      where: { dailyGameId: game.id },
      _avg: { score: true },
      _count: { _all: true },
    });

    res.json({
      averageScore: agg._avg.score ? Number(agg._avg.score.toFixed(2)) : null,
      submissionsCount: agg._count._all,
    });
  } catch (e: unknown) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'Server error';
    res.status(500).json({ error: errorMessage });
  }
});

// OPTIONAL: user history (no login)
app.get('/me/history', async (req, res) => {
  const userId = req.cookies?.userId;
  if (!userId) return res.json({ submissions: [] });

  const submissions = await prisma.submission.findMany({
    where: { userId },
    include: { dailyGame: true },
    orderBy: { createdAt: 'desc' },
    take: Number(req.query.limit ?? 30),
  });

  res.json({
    submissions: submissions.map((s) => ({ dateKey: s.dailyGame.dateKey, score: s.score })),
  });
});

// Export Express app for Vercel
export default app;