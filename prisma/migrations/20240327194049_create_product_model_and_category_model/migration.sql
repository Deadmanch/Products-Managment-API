-- AlterTable
ALTER TABLE "UserModel" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "ProductModel" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "price" MONEY NOT NULL,
    "description" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryModelId" INTEGER NOT NULL,
    "productInfoId" INTEGER NOT NULL,

    CONSTRAINT "ProductModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductInfo" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ProductInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryModel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CategoryModel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductModel" ADD CONSTRAINT "ProductModel_productInfoId_fkey" FOREIGN KEY ("productInfoId") REFERENCES "ProductInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductModel" ADD CONSTRAINT "ProductModel_categoryModelId_fkey" FOREIGN KEY ("categoryModelId") REFERENCES "CategoryModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
