-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('long', 'short');

-- CreateTable
CREATE TABLE "ExistingTrades" (
    "id" TEXT NOT NULL,
    "openPrice" INTEGER NOT NULL,
    "leverage" INTEGER NOT NULL,
    "asset" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "margin" INTEGER NOT NULL,
    "type" "OrderType" NOT NULL,
    "closePrice" INTEGER NOT NULL,
    "pnl" INTEGER NOT NULL,
    "decimal" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "liquidated" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExistingTrades_pkey" PRIMARY KEY ("id")
);
