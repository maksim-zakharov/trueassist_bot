/*
  Warnings:

  - Made the column `nameAccusative` on table `ServiceVariant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ServiceVariant" ALTER COLUMN "nameAccusative" SET NOT NULL,
ALTER COLUMN "nameAccusative" SET DEFAULT '';
