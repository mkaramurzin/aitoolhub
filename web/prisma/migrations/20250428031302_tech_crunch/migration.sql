/*
  Warnings:

  - Added the required column `techCrunchId` to the `TechCrunchSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `techCrunchId` to the `TechCrunchTool` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TechCrunchSummary" ADD COLUMN     "techCrunchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TechCrunchTool" ADD COLUMN     "techCrunchId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TechCrunchSummary" ADD CONSTRAINT "TechCrunchSummary_techCrunchId_fkey" FOREIGN KEY ("techCrunchId") REFERENCES "TechCrunch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechCrunchTool" ADD CONSTRAINT "TechCrunchTool_techCrunchId_fkey" FOREIGN KEY ("techCrunchId") REFERENCES "TechCrunch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
