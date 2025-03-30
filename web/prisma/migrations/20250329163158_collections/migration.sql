-- DropForeignKey
ALTER TABLE "CollectionTool" DROP CONSTRAINT "CollectionTool_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionTool" DROP CONSTRAINT "CollectionTool_toolId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionToolReview" DROP CONSTRAINT "CollectionToolReview_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionToolReview" DROP CONSTRAINT "CollectionToolReview_reviewId_fkey";

-- AddForeignKey
ALTER TABLE "CollectionTool" ADD CONSTRAINT "CollectionTool_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionTool" ADD CONSTRAINT "CollectionTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionToolReview" ADD CONSTRAINT "CollectionToolReview_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionToolReview" ADD CONSTRAINT "CollectionToolReview_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
