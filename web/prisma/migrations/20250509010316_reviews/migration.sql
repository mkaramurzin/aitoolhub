-- CreateTable
CREATE TABLE "EmailReview" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "techCrunchId" TEXT NOT NULL,

    CONSTRAINT "EmailReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailReview_email_key" ON "EmailReview"("email");

-- CreateIndex
CREATE INDEX "EmailReview_email_idx" ON "EmailReview"("email");

-- CreateIndex
CREATE INDEX "EmailReview_techCrunchId_idx" ON "EmailReview"("techCrunchId");
