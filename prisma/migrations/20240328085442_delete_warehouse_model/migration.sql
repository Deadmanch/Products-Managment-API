/*
  Warnings:

  - You are about to drop the column `imgUrl` on the `ProductModel` table. All the data in the column will be lost.
  - You are about to drop the `WarehouseModel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WarehouseModel" DROP CONSTRAINT "WarehouseModel_productId_fkey";

-- AlterTable
ALTER TABLE "ProductModel" DROP COLUMN "imgUrl",
ADD COLUMN     "quanity" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "WarehouseModel";
