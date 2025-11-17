/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `serviceOptionIds` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `ServiceOption` table. All the data in the column will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrderToServiceOption` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `baseServiceId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceVariantId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseServiceId` to the `ServiceOption` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceOption" DROP CONSTRAINT "ServiceOption_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "_OrderToServiceOption" DROP CONSTRAINT "_OrderToServiceOption_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrderToServiceOption" DROP CONSTRAINT "_OrderToServiceOption_B_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "serviceId",
DROP COLUMN "serviceOptionIds",
DROP COLUMN "status",
ADD COLUMN     "baseServiceId" INTEGER NOT NULL,
ADD COLUMN     "optionIds" INTEGER[],
ADD COLUMN     "serviceVariantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ServiceOption" DROP COLUMN "serviceId",
ADD COLUMN     "baseServiceId" INTEGER NOT NULL,
ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Service";

-- DropTable
DROP TABLE "_OrderToServiceOption";

-- CreateTable
CREATE TABLE "BaseService" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BaseService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceVariant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "baseServiceId" INTEGER NOT NULL,

    CONSTRAINT "ServiceVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderServiceOption" (
    "orderId" INTEGER NOT NULL,
    "serviceOptionId" INTEGER NOT NULL,

    CONSTRAINT "OrderServiceOption_pkey" PRIMARY KEY ("orderId","serviceOptionId")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_baseServiceId_fkey" FOREIGN KEY ("baseServiceId") REFERENCES "BaseService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_serviceVariantId_fkey" FOREIGN KEY ("serviceVariantId") REFERENCES "ServiceVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVariant" ADD CONSTRAINT "ServiceVariant_baseServiceId_fkey" FOREIGN KEY ("baseServiceId") REFERENCES "BaseService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOption" ADD CONSTRAINT "ServiceOption_baseServiceId_fkey" FOREIGN KEY ("baseServiceId") REFERENCES "BaseService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderServiceOption" ADD CONSTRAINT "OrderServiceOption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderServiceOption" ADD CONSTRAINT "OrderServiceOption_serviceOptionId_fkey" FOREIGN KEY ("serviceOptionId") REFERENCES "ServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
