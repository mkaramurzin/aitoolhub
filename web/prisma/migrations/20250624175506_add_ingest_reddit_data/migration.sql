-- CreateTable
CREATE TABLE "IngestRedditData" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "permalink" TEXT NOT NULL,
    "text" TEXT,
    "subreddit" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "numComments" INTEGER NOT NULL,
    "postHint" TEXT,
    "thumbnail" TEXT,
    "media" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestRedditData_pkey" PRIMARY KEY ("id")
);
