/*
  Warnings:

  - You are about to drop the column `icon` on the `BaseService` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BaseService" DROP COLUMN "icon";

-- AlterTable
ALTER TABLE "ServiceVariant" ADD COLUMN     "icon" TEXT;
