/*
  Warnings:

  - You are about to drop the column `clicks` on the `ToolAnalytics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ToolAnalytics" DROP COLUMN "clicks",
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;
