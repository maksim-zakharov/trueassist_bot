-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "comments" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);
