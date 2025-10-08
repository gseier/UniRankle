import { PrismaClient } from '@prisma/client';
import universityData from '../src/data/unis.json';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Clear existing university data to prevent duplicates on re-seed
  await prisma.university.deleteMany({});
  console.log('Deleted existing universities.');

  // Create universities from the JSON file
  // The 'externalId' field in your schema is perfect for storing the old 'id' from the JSON file.
  const universitiesToCreate = universityData.map(uni => ({
    name: uni.name,
    ranking: uni.ranking,
    studentCount: uni.studentCount,
    country: uni.country,
    imageUrl: uni.imageUrl,
    externalId: uni.id, // Match the JSON id to the externalId
    yearFounded: uni.yearFounded,
    campusArea: uni.campusArea
  }));

  await prisma.university.createMany({
    data: universitiesToCreate,
  });

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });