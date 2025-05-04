-- CreateTable
CREATE TABLE "TechCrunchIngestXData" (
    "ingestXDataId" TEXT NOT NULL,
    "techCrunchId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechCrunchIngestXData_pkey" PRIMARY KEY ("ingestXDataId","techCrunchId")
);

-- AddForeignKey
ALTER TABLE "TechCrunchIngestXData" ADD CONSTRAINT "TechCrunchIngestXData_ingestXDataId_fkey" FOREIGN KEY ("ingestXDataId") REFERENCES "IngestXData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechCrunchIngestXData" ADD CONSTRAINT "TechCrunchIngestXData_techCrunchId_fkey" FOREIGN KEY ("techCrunchId") REFERENCES "TechCrunch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
