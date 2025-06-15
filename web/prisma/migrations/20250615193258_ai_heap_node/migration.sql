-- CreateTable
CREATE TABLE "AiHeapNode" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "url" TEXT,
    "image" TEXT,
    "metadata" JSONB,
    "parentId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiHeapNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiHeapNode_parentId_idx" ON "AiHeapNode"("parentId");

-- AddForeignKey
ALTER TABLE "AiHeapNode" ADD CONSTRAINT "AiHeapNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AiHeapNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
