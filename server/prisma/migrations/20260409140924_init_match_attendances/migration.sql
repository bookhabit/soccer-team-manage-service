-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('LEAGUE', 'SELF');

-- CreateEnum
CREATE TYPE "AttendanceResponse" AS ENUM ('ATTEND', 'ABSENT', 'UNDECIDED');

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "type" "MatchType" NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "voteDeadline" TIMESTAMP(3) NOT NULL,
    "opponentName" TEXT,
    "opponentLevel" "ClubLevel",
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "isRecordSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "recordedBy" TEXT,
    "recordedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_attendances" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "response" "AttendanceResponse" NOT NULL DEFAULT 'UNDECIDED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_participants" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "match_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_quarters" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "quarterNumber" INTEGER NOT NULL,
    "formation" TEXT NOT NULL,
    "team" TEXT,

    CONSTRAINT "match_quarters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_quarter_assignments" (
    "id" TEXT NOT NULL,
    "quarterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" "PlayerPosition" NOT NULL,

    CONSTRAINT "match_quarter_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_goals" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "scorerUserId" TEXT NOT NULL,
    "assistUserId" TEXT,
    "quarterNumber" INTEGER,
    "team" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mom_votes" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mom_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_comments" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_videos" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "registeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opponent_ratings" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "ratedByUserId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "review" TEXT,
    "mvpName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opponent_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_record_histories" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "editedBy" TEXT NOT NULL,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "beforeData" JSONB NOT NULL,
    "afterData" JSONB NOT NULL,

    CONSTRAINT "match_record_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "matches_clubId_startAt_idx" ON "matches"("clubId", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "match_attendances_matchId_userId_key" ON "match_attendances"("matchId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "match_participants_matchId_userId_key" ON "match_participants"("matchId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "match_quarters_matchId_quarterNumber_team_key" ON "match_quarters"("matchId", "quarterNumber", "team");

-- CreateIndex
CREATE UNIQUE INDEX "match_quarter_assignments_quarterId_userId_key" ON "match_quarter_assignments"("quarterId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "mom_votes_matchId_voterId_key" ON "mom_votes"("matchId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "opponent_ratings_matchId_key" ON "opponent_ratings"("matchId");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_attendances" ADD CONSTRAINT "match_attendances_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_attendances" ADD CONSTRAINT "match_attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_quarters" ADD CONSTRAINT "match_quarters_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_quarter_assignments" ADD CONSTRAINT "match_quarter_assignments_quarterId_fkey" FOREIGN KEY ("quarterId") REFERENCES "match_quarters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_goals" ADD CONSTRAINT "match_goals_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mom_votes" ADD CONSTRAINT "mom_votes_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_comments" ADD CONSTRAINT "match_comments_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_comments" ADD CONSTRAINT "match_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_videos" ADD CONSTRAINT "match_videos_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opponent_ratings" ADD CONSTRAINT "opponent_ratings_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_record_histories" ADD CONSTRAINT "match_record_histories_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
