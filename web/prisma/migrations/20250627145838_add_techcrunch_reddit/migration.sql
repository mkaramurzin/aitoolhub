/*
  Warnings:

  - You are about to drop the column `media` on the `IngestRedditData` table. All the data in the column will be lost.
  - You are about to drop the column `postHint` on the `IngestRedditData` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `IngestRedditData` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `IngestRedditData` table. All the data in the column will be lost.
  - You are about to drop the `Feedback` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_userId_fkey";

-- AlterTable
ALTER TABLE "IngestRedditData" DROP COLUMN "media",
DROP COLUMN "postHint",
DROP COLUMN "thumbnail",
DROP COLUMN "url",
ADD COLUMN     "image" TEXT;

-- DropTable
DROP TABLE "Feedback";
