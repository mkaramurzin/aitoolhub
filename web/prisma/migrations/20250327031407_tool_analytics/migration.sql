/*
  Warnings:

  - You are about to drop the `ToolClicks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ToolClicks" DROP CONSTRAINT "ToolClicks_toolId_fkey";

-- DropForeignKey
ALTER TABLE "ToolClicks" DROP CONSTRAINT "ToolClicks_userId_fkey";

-- DropTable
DROP TABLE "ToolClicks";

-- CreateTable
CREATE TABLE "ToolAnalytics" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "shareClicks" INTEGER NOT NULL DEFAULT 0,
    "tryItNowClicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolAnalytics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ToolAnalytics" ADD CONSTRAINT "ToolAnalytics_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
