/*
  Warnings:

  - You are about to drop the column `endTime` on the `TimeSlot` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `TimeSlot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[scheduleDayId,time]` on the table `TimeSlot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `time` to the `TimeSlot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ScheduleDay" DROP CONSTRAINT "ScheduleDay_userId_fkey";

-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_scheduleDayId_fkey";

-- DropIndex
DROP INDEX "ScheduleDay_userId_idx";

-- AlterTable
ALTER TABLE "TimeSlot" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "time" TIME(6) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TimeSlot_scheduleDayId_time_key" ON "TimeSlot"("scheduleDayId", "time");

-- AddForeignKey
ALTER TABLE "ScheduleDay" ADD CONSTRAINT "ScheduleDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_scheduleDayId_fkey" FOREIGN KEY ("scheduleDayId") REFERENCES "ScheduleDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
