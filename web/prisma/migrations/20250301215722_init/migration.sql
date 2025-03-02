/*
  Warnings:

  - You are about to drop the column `toolId` on the `Tag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_toolId_fkey";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "toolId";
