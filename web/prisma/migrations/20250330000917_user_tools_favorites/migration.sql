-- CreateTable
CREATE TABLE "UserToolFavorite" (
    "userId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserToolFavorite_pkey" PRIMARY KEY ("userId","toolId")
);

-- AddForeignKey
ALTER TABLE "UserToolFavorite" ADD CONSTRAINT "UserToolFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToolFavorite" ADD CONSTRAINT "UserToolFavorite_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
