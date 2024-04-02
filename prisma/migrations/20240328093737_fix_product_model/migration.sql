/*
  Warnings:

  - You are about to drop the column `categoryModelId` on the `ProductModel` table. All the data in the column will be lost.
  - You are about to drop the column `productInfoId` on the `ProductModel` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `ProductModel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductModel" DROP CONSTRAINT "ProductModel_categoryModelId_fkey";

-- AlterTable
ALTER TABLE "ProductModel" DROP COLUMN "categoryModelId",
DROP COLUMN "productInfoId",
ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductModel" ADD CONSTRAINT "ProductModel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
