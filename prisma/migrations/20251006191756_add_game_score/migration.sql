-- CreateTable
CREATE TABLE "GameScore" (
    "id" TEXT NOT NULL,
    "cookieId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameScore_pkey" PRIMARY KEY ("id")
);
