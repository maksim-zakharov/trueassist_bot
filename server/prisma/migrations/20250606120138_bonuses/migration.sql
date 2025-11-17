-- CreateEnum
CREATE TYPE "BonusOperationType" AS ENUM ('GIFT', 'INVITE', 'ORDER', 'WITHDRAWAL');

-- CreateTable
CREATE TABLE "BonusOperation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" INTEGER NOT NULL,
    "type" "BonusOperationType" NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BonusOperation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BonusOperation" ADD CONSTRAINT "BonusOperation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
