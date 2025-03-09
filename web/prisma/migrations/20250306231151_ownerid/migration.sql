-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "ownerId" TEXT;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
