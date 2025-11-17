/*
  Warnings:

  - You are about to drop the `OrderServiceOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderServiceOption" DROP CONSTRAINT "OrderServiceOption_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderServiceOption" DROP CONSTRAINT "OrderServiceOption_serviceOptionId_fkey";

-- DropTable
DROP TABLE "OrderServiceOption";

-- CreateTable
CREATE TABLE "_OrderToServiceOption" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OrderToServiceOption_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OrderToServiceOption_B_index" ON "_OrderToServiceOption"("B");

-- AddForeignKey
ALTER TABLE "_OrderToServiceOption" ADD CONSTRAINT "_OrderToServiceOption_A_fkey" FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToServiceOption" ADD CONSTRAINT "_OrderToServiceOption_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
