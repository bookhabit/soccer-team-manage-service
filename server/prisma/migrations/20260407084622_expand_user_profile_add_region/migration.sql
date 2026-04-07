/*
  Warnings:

  - You are about to drop the column `nickname` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `skillLevel` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `matches` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team_join_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teams` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'KAKAO', 'GOOGLE', 'APPLE');

-- CreateEnum
CREATE TYPE "PlayerFoot" AS ENUM ('LEFT', 'RIGHT', 'BOTH');

-- CreateEnum
CREATE TYPE "PlayerLevel" AS ENUM ('BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'RESTRICTED', 'DELETED');

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_awayTeamId_fkey";

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_homeTeamId_fkey";

-- DropForeignKey
ALTER TABLE "team_join_requests" DROP CONSTRAINT "team_join_requests_teamId_fkey";

-- DropForeignKey
ALTER TABLE "team_join_requests" DROP CONSTRAINT "team_join_requests_userId_fkey";

-- DropForeignKey
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_teamId_fkey";

-- DropForeignKey
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_captainId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "nickname",
DROP COLUMN "skillLevel",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "birthYear" INTEGER,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "foot" "PlayerFoot",
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "level" "PlayerLevel",
ADD COLUMN     "mannerScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "preferredRegionId" TEXT,
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "years" INTEGER,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- DropTable
DROP TABLE "matches";

-- DropTable
DROP TABLE "team_join_requests";

-- DropTable
DROP TABLE "team_members";

-- DropTable
DROP TABLE "teams";

-- DropEnum
DROP TYPE "JoinRequestStatus";

-- DropEnum
DROP TYPE "MatchStatus";

-- DropEnum
DROP TYPE "TeamRole";

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sigungu" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_preferredRegionId_fkey" FOREIGN KEY ("preferredRegionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
