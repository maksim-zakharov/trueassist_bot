-- CreateTable
CREATE TABLE "Keyword" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_value_key" ON "Keyword"("value");

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "BaseService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
