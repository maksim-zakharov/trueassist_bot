/*
  Warnings:

  - A unique constraint covering the columns `[userId,dayOfWeek]` on the table `ScheduleDay` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ScheduleDay_dayOfWeek_key";

-- CreateIndex
CREATE INDEX "ScheduleDay_userId_idx" ON "ScheduleDay"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleDay_userId_dayOfWeek_key" ON "ScheduleDay"("userId", "dayOfWeek");
