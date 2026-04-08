import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClubLevel, ClubRole, RecruitmentStatus, DissolveVoteStatus, JoinRequestStatus } from '@prisma/client';

// ─── 공통 ─────────────────────────────────────────────────────────────────────

export class RegionNameDto {
  @ApiProperty({ example: '서울특별시 강남구' })
  regionName!: string;
}

// ─── 클럽 ─────────────────────────────────────────────────────────────────────

export class ClubDetailResponseDto {
  @ApiProperty({ example: 'clx1234clubId' })
  id!: string;

  @ApiProperty({ example: 'FC 서울 드래곤즈' })
  name!: string;

  @ApiProperty({ enum: ClubLevel, example: ClubLevel.AMATEUR })
  level!: ClubLevel;

  @ApiProperty({ example: 25 })
  maxMemberCount!: number;

  @ApiProperty({ example: 12 })
  currentMemberCount!: number;

  @ApiProperty({ example: 97.5 })
  mannerScoreAvg!: number;

  @ApiProperty({ enum: RecruitmentStatus, example: RecruitmentStatus.OPEN })
  recruitmentStatus!: RecruitmentStatus;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png', nullable: true })
  logoUrl!: string | null;

  @ApiPropertyOptional({ example: '주 2회 정기 운동하는 아마추어 팀입니다.', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'clx1234regionId' })
  regionId!: string;

  @ApiProperty({ example: '서울특별시 강남구' })
  regionName!: string;

  @ApiPropertyOptional({ enum: ClubRole, example: ClubRole.CAPTAIN, nullable: true })
  myRole!: ClubRole | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: string;
}

export class ClubPreviewResponseDto {
  @ApiProperty({ example: 'clx1234clubId' })
  id!: string;

  @ApiProperty({ example: 'FC 서울 드래곤즈' })
  name!: string;

  @ApiProperty({ enum: ClubLevel, example: ClubLevel.AMATEUR })
  level!: ClubLevel;

  @ApiProperty({ example: 97.5 })
  mannerScoreAvg!: number;

  @ApiProperty({ example: '서울특별시 강남구' })
  regionName!: string;

  @ApiProperty({ example: 12 })
  currentMemberCount!: number;

  @ApiProperty({ example: 25 })
  maxMemberCount!: number;

  @ApiProperty({ enum: RecruitmentStatus, example: RecruitmentStatus.OPEN })
  recruitmentStatus!: RecruitmentStatus;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png', nullable: true })
  logoUrl!: string | null;
}

export class ClubPreviewPageResponseDto {
  @ApiProperty({ type: [ClubPreviewResponseDto] })
  data!: ClubPreviewResponseDto[];

  @ApiPropertyOptional({ example: 'clx1234cursor', nullable: true })
  nextCursor!: string | null;
}

// ─── 팀원 ─────────────────────────────────────────────────────────────────────

export class MemberStatsDto {
  @ApiProperty({ example: 0 })
  goals!: number;

  @ApiProperty({ example: 0 })
  assists!: number;

  @ApiProperty({ example: 0 })
  momCount!: number;

  @ApiProperty({ example: 0 })
  matchCount!: number;
}

export class ClubMemberResponseDto {
  @ApiProperty({ example: 'clx1234userId' })
  userId!: string;

  @ApiProperty({ example: '홍길동' })
  name!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png', nullable: true })
  avatarUrl!: string | null;

  @ApiPropertyOptional({ example: 10, nullable: true })
  jerseyNumber!: number | null;

  @ApiProperty({ enum: ClubRole, example: ClubRole.MEMBER })
  role!: ClubRole;

  @ApiPropertyOptional({ example: 'MF', nullable: true })
  position!: string | null;

  @ApiProperty({ example: 97.5 })
  mannerScore!: number;

  @ApiProperty({ type: MemberStatsDto })
  stats!: MemberStatsDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  joinedAt!: string;
}

export class ClubMemberPageResponseDto {
  @ApiProperty({ type: [ClubMemberResponseDto] })
  data!: ClubMemberResponseDto[];

  @ApiPropertyOptional({ example: 'clx1234cursor', nullable: true })
  nextCursor!: string | null;
}

// ─── 가입 신청 ────────────────────────────────────────────────────────────────

export class JoinRequestResponseDto {
  @ApiProperty({ example: 'clx1234requestId' })
  id!: string;

  @ApiProperty({ example: 'clx1234userId' })
  userId!: string;

  @ApiProperty({ example: '홍길동' })
  userName!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png', nullable: true })
  userAvatarUrl!: string | null;

  @ApiPropertyOptional({ example: 'MF', nullable: true })
  userPosition!: string | null;

  @ApiPropertyOptional({ example: 'AMATEUR', nullable: true })
  userLevel!: string | null;

  @ApiProperty({ example: 97.5 })
  userMannerScore!: number;

  @ApiPropertyOptional({ example: '안녕하세요, 열심히 하겠습니다.', nullable: true })
  message!: string | null;

  @ApiProperty({ enum: JoinRequestStatus, example: JoinRequestStatus.PENDING })
  status!: JoinRequestStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: string;
}

export class JoinRequestPageResponseDto {
  @ApiProperty({ type: [JoinRequestResponseDto] })
  data!: JoinRequestResponseDto[];

  @ApiPropertyOptional({ example: 'clx1234cursor', nullable: true })
  nextCursor!: string | null;
}

export class CreateJoinRequestResponseDto {
  @ApiProperty({ example: 'clx1234requestId' })
  id!: string;

  @ApiProperty({ enum: JoinRequestStatus, example: JoinRequestStatus.PENDING })
  status!: JoinRequestStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: string;
}

// ─── 초대 코드 ────────────────────────────────────────────────────────────────

export class InviteCodeResponseDto {
  @ApiProperty({ example: 'A1B2C3D4' })
  code!: string;

  @ApiProperty({ example: '2024-01-08T00:00:00.000Z' })
  expiresAt!: string;

  @ApiProperty({ example: false })
  isExpired!: boolean;
}

// ─── 해체 투표 ────────────────────────────────────────────────────────────────

export class DissolveVoteResponseDto {
  @ApiProperty({ example: 'clx1234voteId' })
  id!: string;

  @ApiProperty({ enum: DissolveVoteStatus, example: DissolveVoteStatus.IN_PROGRESS })
  status!: DissolveVoteStatus;

  @ApiProperty({ example: '2024-01-03T00:00:00.000Z' })
  expiresAt!: string;

  @ApiProperty({ example: 5 })
  totalCount!: number;

  @ApiProperty({ example: 2 })
  agreedCount!: number;

  @ApiPropertyOptional({ example: true, nullable: true })
  myResponse!: boolean | null;
}
