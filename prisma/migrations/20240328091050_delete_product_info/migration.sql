/*
  Warnings:

  - You are about to drop the `ProductInfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductModel" DROP CONSTRAINT "ProductModel_productInfoId_fkey";

-- AlterTable
ALTER TABLE "ProductModel" ALTER COLUMN "description" DROP NOT NULL;

-- DropTable
DROP TABLE "ProductInfo";
