-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('active', 'completed', 'canceled');

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'active',
    "serviceName" TEXT NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "date" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
