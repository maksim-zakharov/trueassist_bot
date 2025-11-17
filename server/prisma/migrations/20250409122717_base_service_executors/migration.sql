-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ServiceExecutors" (
    "serviceId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ServiceExecutors_pkey" PRIMARY KEY ("serviceId","userId")
);

-- CreateIndex
CREATE INDEX "ServiceExecutors_userId_idx" ON "ServiceExecutors"("userId");

-- AddForeignKey
ALTER TABLE "ServiceExecutors" ADD CONSTRAINT "ServiceExecutors_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "BaseService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceExecutors" ADD CONSTRAINT "ServiceExecutors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
