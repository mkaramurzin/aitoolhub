/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Tool` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");
