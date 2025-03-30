/*
  Warnings:

  - The primary key for the `CollectionToolReview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `CollectionToolReview` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CollectionToolReview" DROP CONSTRAINT "CollectionToolReview_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "CollectionToolReview_pkey" PRIMARY KEY ("collectionId", "reviewId");
