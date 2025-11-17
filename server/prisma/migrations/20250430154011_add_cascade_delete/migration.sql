-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationVariants" DROP CONSTRAINT "ApplicationVariants_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationVariants" DROP CONSTRAINT "ApplicationVariants_variantId_fkey";

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationVariants" ADD CONSTRAINT "ApplicationVariants_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationVariants" ADD CONSTRAINT "ApplicationVariants_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ServiceVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
