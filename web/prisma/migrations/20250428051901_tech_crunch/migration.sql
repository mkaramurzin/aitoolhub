-- CreateTable
CREATE TABLE "TechCrunchBreakingNews" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "techCrunchId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechCrunchBreakingNews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TechCrunchBreakingNews" ADD CONSTRAINT "TechCrunchBreakingNews_techCrunchId_fkey" FOREIGN KEY ("techCrunchId") REFERENCES "TechCrunch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
