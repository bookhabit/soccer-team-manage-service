-- CreateEnum
CREATE TYPE "MercenaryPostStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "MercenaryApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NoShowReportStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "MatchPostStatus" ADD VALUE 'CANCELLED';

-- CreateTable
CREATE TABLE "mercenary_posts" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "positions" "PlayerPosition"[],
    "requiredCount" INTEGER NOT NULL,
    "acceptedCount" INTEGER NOT NULL DEFAULT 0,
    "matchDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "level" "ClubLevel" NOT NULL,
    "fee" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "status" "MercenaryPostStatus" NOT NULL DEFAULT 'OPEN',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mercenary_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercenary_availabilities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "positions" "PlayerPosition"[],
    "availableDates" TIMESTAMP(3)[],
    "regionIds" TEXT[],
    "timeSlot" TEXT,
    "bio" TEXT,
    "acceptsFee" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mercenary_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercenary_applications" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "message" TEXT,
    "status" "MercenaryApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mercenary_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercenary_recruitments" (
    "id" TEXT NOT NULL,
    "availabilityId" TEXT NOT NULL,
    "recruitingClubId" TEXT NOT NULL,
    "recruitedBy" TEXT NOT NULL,
    "message" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "status" "MercenaryApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mercenary_recruitments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "no_show_reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedUserId" TEXT NOT NULL,
    "applicationId" TEXT,
    "recruitmentId" TEXT,
    "reason" TEXT NOT NULL,
    "status" "NoShowReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "no_show_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mercenary_posts_matchDate_idx" ON "mercenary_posts"("matchDate");

-- CreateIndex
CREATE INDEX "mercenary_posts_regionId_idx" ON "mercenary_posts"("regionId");

-- CreateIndex
CREATE INDEX "mercenary_posts_level_idx" ON "mercenary_posts"("level");

-- CreateIndex
CREATE INDEX "mercenary_posts_clubId_idx" ON "mercenary_posts"("clubId");

-- CreateIndex
CREATE INDEX "mercenary_availabilities_userId_idx" ON "mercenary_availabilities"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mercenary_applications_postId_applicantId_key" ON "mercenary_applications"("postId", "applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "mercenary_recruitments_availabilityId_recruitingClubId_key" ON "mercenary_recruitments"("availabilityId", "recruitingClubId");

-- CreateIndex
CREATE UNIQUE INDEX "no_show_reports_reporterId_applicationId_key" ON "no_show_reports"("reporterId", "applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "no_show_reports_reporterId_recruitmentId_key" ON "no_show_reports"("reporterId", "recruitmentId");

-- AddForeignKey
ALTER TABLE "mercenary_posts" ADD CONSTRAINT "mercenary_posts_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mercenary_posts" ADD CONSTRAINT "mercenary_posts_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mercenary_availabilities" ADD CONSTRAINT "mercenary_availabilities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mercenary_applications" ADD CONSTRAINT "mercenary_applications_postId_fkey" FOREIGN KEY ("postId") REFERENCES "mercenary_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mercenary_applications" ADD CONSTRAINT "mercenary_applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mercenary_recruitments" ADD CONSTRAINT "mercenary_recruitments_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "mercenary_availabilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mercenary_recruitments" ADD CONSTRAINT "mercenary_recruitments_recruitingClubId_fkey" FOREIGN KEY ("recruitingClubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "no_show_reports" ADD CONSTRAINT "no_show_reports_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "mercenary_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "no_show_reports" ADD CONSTRAINT "no_show_reports_recruitmentId_fkey" FOREIGN KEY ("recruitmentId") REFERENCES "mercenary_recruitments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
