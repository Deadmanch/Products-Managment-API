-- AlterTable
ALTER TABLE "ProductModel" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "WarehouseModel" (
    "productId" INTEGER NOT NULL,
    "quanity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseModel_productId_key" ON "WarehouseModel"("productId");

-- AddForeignKey
ALTER TABLE "WarehouseModel" ADD CONSTRAINT "WarehouseModel_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
