/*
  Warnings:

  - Added the required column `image` to the `Collection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "image" TEXT NOT NULL;
