-- CreateTable
CREATE TABLE "Mats" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "cellType" TEXT NOT NULL,
    "edgeColor" TEXT NOT NULL,

    CONSTRAINT "Mats_pkey" PRIMARY KEY ("id")
);
