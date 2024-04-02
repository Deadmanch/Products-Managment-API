-- DropForeignKey
ALTER TABLE "ProductModel" DROP CONSTRAINT "ProductModel_categoryId_fkey";

-- AlterTable
ALTER TABLE "ProductModel" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductModel" ADD CONSTRAINT "ProductModel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
