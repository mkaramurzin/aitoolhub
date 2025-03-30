/*
  Warnings:

  - The primary key for the `CollectionTool` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `CollectionTool` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CollectionTool" DROP CONSTRAINT "CollectionTool_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "CollectionTool_pkey" PRIMARY KEY ("collectionId", "toolId");
