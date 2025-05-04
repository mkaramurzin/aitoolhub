-- CreateTable
CREATE TABLE "IngestData" (
    "id" TEXT NOT NULL,
    "postId" TEXT,
    "source" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestData_pkey" PRIMARY KEY ("id")
);
