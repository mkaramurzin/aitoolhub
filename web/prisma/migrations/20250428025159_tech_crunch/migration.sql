-- CreateTable
CREATE TABLE "TechCrunch" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechCrunch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechCrunchSponsor" (
    "id" TEXT NOT NULL,
    "techCrunchId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechCrunchSponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechCrunchSummary" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechCrunchSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechCrunchTool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechCrunchTool_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TechCrunchSponsor" ADD CONSTRAINT "TechCrunchSponsor_techCrunchId_fkey" FOREIGN KEY ("techCrunchId") REFERENCES "TechCrunch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechCrunchSponsor" ADD CONSTRAINT "TechCrunchSponsor_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
