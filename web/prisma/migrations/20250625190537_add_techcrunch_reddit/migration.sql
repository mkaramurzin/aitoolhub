-- CreateTable
CREATE TABLE "TechCrunchIngestRedditData" (
    "ingestRedditDataId" TEXT NOT NULL,
    "techCrunchId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechCrunchIngestRedditData_pkey" PRIMARY KEY ("ingestRedditDataId","techCrunchId")
);

-- AddForeignKey
ALTER TABLE "TechCrunchIngestRedditData" ADD CONSTRAINT "TechCrunchIngestRedditData_ingestRedditDataId_fkey" FOREIGN KEY ("ingestRedditDataId") REFERENCES "IngestRedditData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechCrunchIngestRedditData" ADD CONSTRAINT "TechCrunchIngestRedditData_techCrunchId_fkey" FOREIGN KEY ("techCrunchId") REFERENCES "TechCrunch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
