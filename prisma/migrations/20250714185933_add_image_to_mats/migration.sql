/*
  Warnings:

  - Added the required column `image` to the `Mats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mats" ADD COLUMN     "image" TEXT NOT NULL;
