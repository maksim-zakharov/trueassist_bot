-- AlterTable
ALTER TABLE "Keyword" ADD COLUMN     "variantId" INTEGER;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ServiceVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
