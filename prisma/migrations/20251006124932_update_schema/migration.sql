/*
  Warnings:

  - The primary key for the `University` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `score` on the `University` table. All the data in the column will be lost.
  - You are about to drop the `DailyChallenge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `imageUrl` to the `University` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ranking` to the `University` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `University` table without a default value. This is not possible if the table is not empty.
  - Made the column `studentCount` on table `University` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `University` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "RankingBy" AS ENUM ('RANKING', 'STUDENT_COUNT');

-- DropForeignKey
ALTER TABLE "public"."GameResult" DROP CONSTRAINT "GameResult_dailyChallengeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GameResult" DROP CONSTRAINT "GameResult_playerId_fkey";

-- DropIndex
DROP INDEX "public"."University_name_key";

-- AlterTable
ALTER TABLE "University" DROP CONSTRAINT "University_pkey",
DROP COLUMN "score",
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "ranking" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "studentCount" SET NOT NULL,
ALTER COLUMN "country" SET NOT NULL,
ADD CONSTRAINT "University_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "University_id_seq";

-- DropTable
DROP TABLE "public"."DailyChallenge";

-- DropTable
DROP TABLE "public"."GameResult";

-- DropTable
DROP TABLE "public"."Player";

-- CreateTable
CREATE TABLE "DailyGame" (
    "id" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "rankingBy" "RankingBy" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyGameUniversity" (
    "id" TEXT NOT NULL,
    "dailyGameId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyGameUniversity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyGame_dateKey_key" ON "DailyGame"("dateKey");

-- CreateIndex
CREATE INDEX "DailyGame_dateKey_idx" ON "DailyGame"("dateKey");

-- CreateIndex
CREATE INDEX "DailyGameUniversity_dailyGameId_orderIndex_idx" ON "DailyGameUniversity"("dailyGameId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "DailyGameUniversity_dailyGameId_universityId_key" ON "DailyGameUniversity"("dailyGameId", "universityId");

-- AddForeignKey
ALTER TABLE "DailyGameUniversity" ADD CONSTRAINT "DailyGameUniversity_dailyGameId_fkey" FOREIGN KEY ("dailyGameId") REFERENCES "DailyGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyGameUniversity" ADD CONSTRAINT "DailyGameUniversity_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
