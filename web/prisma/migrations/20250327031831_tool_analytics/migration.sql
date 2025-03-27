/*
  Warnings:

  - The primary key for the `ToolAnalytics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ToolAnalytics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ToolAnalytics" DROP CONSTRAINT "ToolAnalytics_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ToolAnalytics_pkey" PRIMARY KEY ("toolId");
