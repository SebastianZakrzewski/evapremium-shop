-- CreateTable
CREATE TABLE "CarBrand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "logo" TEXT,
    "description" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarBrand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarBrand_name_key" ON "CarBrand"("name");
