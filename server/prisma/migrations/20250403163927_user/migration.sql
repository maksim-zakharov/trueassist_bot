-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('client', 'executor', 'admin');

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'client',
    "lastName" TEXT,
    "photoUrl" TEXT,
    "username" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
