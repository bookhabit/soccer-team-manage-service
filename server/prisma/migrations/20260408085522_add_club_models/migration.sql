-- CreateEnum
CREATE TYPE "ClubLevel" AS ENUM ('BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO');

-- CreateEnum
CREATE TYPE "RecruitmentStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ClubRole" AS ENUM ('CAPTAIN', 'VICE_CAPTAIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('NOTICE', 'GENERAL', 'INQUIRY');

-- CreateEnum
CREATE TYPE "DissolveVoteStatus" AS ENUM ('IN_PROGRESS', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "clubs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "level" "ClubLevel" NOT NULL,
    "maxMemberCount" INTEGER NOT NULL,
    "currentMemberCount" INTEGER NOT NULL DEFAULT 1,
    "mannerScoreAvg" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "recruitmentStatus" "RecruitmentStatus" NOT NULL DEFAULT 'OPEN',
    "logoUrl" TEXT,
    "description" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_members" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ClubRole" NOT NULL DEFAULT 'MEMBER',
    "jerseyNumber" INTEGER,
    "speed" INTEGER,
    "shoot" INTEGER,
    "pass" INTEGER,
    "dribble" INTEGER,
    "defense" INTEGER,
    "physical" INTEGER,
    "isStatsPublic" BOOLEAN NOT NULL DEFAULT true,
    "isPhonePublic" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_join_requests" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "status" "JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_invite_codes" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_invite_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_ban_records" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bannedBy" TEXT NOT NULL,
    "bannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_ban_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_dissolve_votes" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "initiatedBy" TEXT NOT NULL,
    "status" "DissolveVoteStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_dissolve_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_dissolve_vote_responses" (
    "id" TEXT NOT NULL,
    "voteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agreed" BOOLEAN NOT NULL,

    CONSTRAINT "club_dissolve_vote_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "PostType" NOT NULL DEFAULT 'GENERAL',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "club_members_clubId_userId_key" ON "club_members"("clubId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "club_members_clubId_jerseyNumber_key" ON "club_members"("clubId", "jerseyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "club_join_requests_clubId_userId_key" ON "club_join_requests"("clubId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "club_invite_codes_code_key" ON "club_invite_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "club_dissolve_vote_responses_voteId_userId_key" ON "club_dissolve_vote_responses"("voteId", "userId");

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_join_requests" ADD CONSTRAINT "club_join_requests_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_join_requests" ADD CONSTRAINT "club_join_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_invite_codes" ADD CONSTRAINT "club_invite_codes_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_ban_records" ADD CONSTRAINT "club_ban_records_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_dissolve_votes" ADD CONSTRAINT "club_dissolve_votes_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_dissolve_vote_responses" ADD CONSTRAINT "club_dissolve_vote_responses_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "club_dissolve_votes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
