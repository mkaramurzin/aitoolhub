/*
  Warnings:

  - Added the required column `rating` to the `EmailReview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailReview" ADD COLUMN     "rating" INTEGER NOT NULL;
