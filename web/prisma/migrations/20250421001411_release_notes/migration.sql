-- CreateTable
CREATE TABLE "ToolRelease" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "releaseDate" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolRelease_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ToolRelease" ADD CONSTRAINT "ToolRelease_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
