-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'PHOTO');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'TEXT';
