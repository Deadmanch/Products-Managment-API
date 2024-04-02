/*
  Warnings:

  - You are about to drop the column `quanity` on the `ProductModel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductModel" DROP COLUMN "quanity",
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0;
