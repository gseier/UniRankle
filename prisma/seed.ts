// prisma/seed.ts
import { PrismaClient, RankingBy } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

type UnivJson = {
  id?: string;
  name: string;
  ranking: number;
  studentCount: number;
  country: string;
  imageUrl: string;
};

function seededRandomGenerator(seedStr: string) {
  // returns a function () => [0,1) deterministic from seed
  const hash = crypto.createHash('sha256').update(seedStr).digest();
  let idx = 0;
  return () => {
    // simple xorshift-ish using bytes of hash
    const a = hash[idx % hash.length];
    const b = hash[(idx + 7) % hash.length];
    idx++;
    const n = (a * 256 + b) / 65536;
    return n % 1;
  };
}

function seededShuffle<T>(arr: T[], seed: string) {
  const rng = seededRandomGenerator(seed);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

async function main() {
  const dataPath = path.resolve(__dirname, '../src/data/unis.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const unis: UnivJson[] = JSON.parse(raw);

  console.log(`Upserting ${unis.length} universities...`);
  // Upsert universities by externalId or name
  for (const u of unis) {
    const externalId = u.id ?? u.name;
    await prisma.university.upsert({
      where: { id: externalId },
      update: {
        name: u.name,
        ranking: u.ranking,
        studentCount: u.studentCount,
        country: u.country,
        imageUrl: u.imageUrl,
      },
      create: {
        externalId,
        name: u.name,
        ranking: u.ranking,
        studentCount: u.studentCount,
        country: u.country,
        imageUrl: u.imageUrl,
      },
    });
  }

  // Create the daily game for a given date
  const today = new Date();
  const isoDate = today.toISOString().slice(0, 10); // "YYYY-MM-DD"
  console.log(`Creating daily game for date: ${isoDate}`);

  // Choose rankingBy deterministically: hash the date then pick
  const choice = crypto.createHash('sha256').update(isoDate).digest('hex');
  const rankingBy = parseInt(choice.slice(0, 8), 16) % 2 === 0 ? RankingBy.RANKING : RankingBy.STUDENT_COUNT;

  // Read schools from DB
  const allUnis = await prisma.university.findMany();
  if (allUnis.length < 5) {
    throw new Error('Need at least 5 universities in the DB to create a daily challenge.');
  }

  // Deterministically pick 5 unique universities based on seed
  const shuffled = seededShuffle(allUnis, isoDate);
  const selected = shuffled.slice(0, 5);

  // Determine correct order according to rankingBy
  const correctList = [...selected].sort((a, b) => {
    if (rankingBy === RankingBy.STUDENT_COUNT) {
      return b.studentCount - a.studentCount; // highest studentCount first
    } else {
      return a.ranking - b.ranking; // lowest ranking number first
    }
  });

  // Upsert the DailyGame row
  const existing = await prisma.dailyGame.findUnique({ where: { dateKey: isoDate } });
  let dailyGameId: string;
  if (existing) {
    console.log('DailyGame already exists for this date. Skipping create.');
    dailyGameId = existing.id;
  } else {
    const dg = await prisma.dailyGame.create({
      data: {
        dateKey: isoDate,
        rankingBy,
      },
    });
    dailyGameId = dg.id;

    // Create pivot entries with the correct orderIndex
    for (let idx = 0; idx < correctList.length; idx++) {
      await prisma.dailyGameUniversity.create({
        data: {
          dailyGameId,
          universityId: correctList[idx].id,
          orderIndex: idx,
        },
      });
    }
    console.log('DailyGame and entries created.');
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
