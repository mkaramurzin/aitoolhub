/*
  Warnings:

  - Added the required column `url` to the `TechCrunchBreakingNews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TechCrunchBreakingNews" ADD COLUMN     "url" TEXT NOT NULL;
