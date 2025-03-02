/*
  Warnings:

  - The primary key for the `UserVote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserVote` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserVote_reviewId_idx";

-- DropIndex
DROP INDEX "UserVote_userId_idx";

-- AlterTable
ALTER TABLE "UserVote" DROP CONSTRAINT "UserVote_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "UserVote_pkey" PRIMARY KEY ("userId", "reviewId");
