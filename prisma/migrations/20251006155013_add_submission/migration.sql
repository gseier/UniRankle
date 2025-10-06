-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "dailyGameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "finalOrder" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_dailyGameId_idx" ON "Submission"("dailyGameId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_dailyGameId_userId_key" ON "Submission"("dailyGameId", "userId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_dailyGameId_fkey" FOREIGN KEY ("dailyGameId") REFERENCES "DailyGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;
