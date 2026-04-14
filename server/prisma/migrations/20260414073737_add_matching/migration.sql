-- CreateEnum
CREATE TYPE "MatchPostStatus" AS ENUM ('OPEN', 'MATCHED');

-- CreateEnum
CREATE TYPE "MatchApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MatchGender" AS ENUM ('MALE', 'FEMALE', 'MIXED');

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "matchPostId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "match_posts" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "matchDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "playerCount" INTEGER NOT NULL,
    "gender" "MatchGender" NOT NULL,
    "level" "ClubLevel" NOT NULL,
    "fee" INTEGER NOT NULL DEFAULT 0,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "status" "MatchPostStatus" NOT NULL DEFAULT 'OPEN',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_applications" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "applicantClubId" TEXT NOT NULL,
    "applicantUserId" TEXT NOT NULL,
    "message" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "status" "MatchApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "match_posts_matchDate_idx" ON "match_posts"("matchDate");

-- CreateIndex
CREATE INDEX "match_posts_regionId_idx" ON "match_posts"("regionId");

-- CreateIndex
CREATE INDEX "match_posts_level_idx" ON "match_posts"("level");

-- CreateIndex
CREATE INDEX "match_posts_gender_idx" ON "match_posts"("gender");

-- CreateIndex
CREATE INDEX "match_posts_fee_idx" ON "match_posts"("fee");

-- CreateIndex
CREATE INDEX "match_posts_clubId_idx" ON "match_posts"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "match_applications_postId_applicantClubId_key" ON "match_applications"("postId", "applicantClubId");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_matchPostId_fkey" FOREIGN KEY ("matchPostId") REFERENCES "match_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_posts" ADD CONSTRAINT "match_posts_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_posts" ADD CONSTRAINT "match_posts_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_posts" ADD CONSTRAINT "match_posts_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_applications" ADD CONSTRAINT "match_applications_postId_fkey" FOREIGN KEY ("postId") REFERENCES "match_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_applications" ADD CONSTRAINT "match_applications_applicantClubId_fkey" FOREIGN KEY ("applicantClubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_applications" ADD CONSTRAINT "match_applications_applicantUserId_fkey" FOREIGN KEY ("applicantUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
