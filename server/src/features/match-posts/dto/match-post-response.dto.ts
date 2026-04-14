import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClubLevel } from '@prisma/client';

// 마이그레이션 후 @prisma/client 에서 import 가능
enum MatchPostStatus { OPEN = 'OPEN', MATCHED = 'MATCHED' }
enum MatchApplicationStatus { PENDING = 'PENDING', ACCEPTED = 'ACCEPTED', REJECTED = 'REJECTED' }
enum MatchGender { MALE = 'MALE', FEMALE = 'FEMALE', MIXED = 'MIXED' }

// ─── 게시글 요약 (목록 아이템) ──────────────────────────────────────────────────

export class MatchPostSummaryResponseDto {
  @ApiProperty({ example: 'clx1234postId' })
  id!: string;

  @ApiProperty({ example: 'clx1234clubId' })
  clubId!: string;

  @ApiProperty({ example: '카동FC' })
  clubName!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png', nullable: true })
  clubLogoUrl!: string | null;

  @ApiProperty({ enum: ClubLevel, example: ClubLevel.AMATEUR })
  clubLevel!: ClubLevel;

  @ApiProperty({ example: '2026-05-10T00:00:00.000Z' })
  matchDate!: Date;

  @ApiProperty({ example: '14:00' })
  startTime!: string;

  @ApiProperty({ example: '16:00' })
  endTime!: string;

  @ApiProperty({ example: '서울 월드컵경기장' })
  location!: string;

  @ApiPropertyOptional({ example: '서울특별시 마포구 월드컵로 240', nullable: true })
  address!: string | null;

  @ApiProperty({ example: 11 })
  playerCount!: number;

  @ApiProperty({ enum: MatchGender, example: MatchGender.MIXED })
  gender!: MatchGender;

  @ApiProperty({ enum: ClubLevel, example: ClubLevel.AMATEUR })
  level!: ClubLevel;

  @ApiProperty({ example: 0, description: '참가비 원(KRW), 0=무료' })
  fee!: number;

  @ApiProperty({ enum: MatchPostStatus, example: MatchPostStatus.OPEN })
  status!: MatchPostStatus;

  @ApiProperty({ example: false, description: '만료 여부 (matchDate < now, 서버 계산)' })
  isExpired!: boolean;

  @ApiProperty({ example: '2026-04-15T10:00:00.000Z' })
  createdAt!: Date;

  // 지역 정보
  @ApiProperty({ example: '서울특별시' })
  regionName!: string;

  @ApiProperty({ example: '마포구' })
  regionSigungu!: string;
}

export class MatchPostListResponseDto {
  @ApiProperty({ type: [MatchPostSummaryResponseDto] })
  items!: MatchPostSummaryResponseDto[];

  @ApiPropertyOptional({ example: 'clx1234cursor', nullable: true })
  nextCursor!: string | null;
}

// ─── 게시글 상세 ──────────────────────────────────────────────────────────────

export class MatchPostDetailResponseDto extends MatchPostSummaryResponseDto {
  @ApiProperty({ example: false, description: '본인 팀 게시글 여부' })
  isOwnPost!: boolean;

  @ApiProperty({ example: true, description: '신청 가능 여부' })
  canApply!: boolean;

  // 수락 후에만 포함 (nullable)
  @ApiPropertyOptional({ example: '홍길동', nullable: true })
  contactName!: string | null;

  @ApiPropertyOptional({ example: '010-1234-5678', nullable: true })
  contactPhone!: string | null;
}

// ─── 신청 아이템 ──────────────────────────────────────────────────────────────

export class MatchApplicationItemResponseDto {
  @ApiProperty({ example: 'clx1234appId' })
  id!: string;

  @ApiProperty({ example: 'clx1234postId' })
  postId!: string;

  @ApiProperty({ example: 'clx1234clubId' })
  applicantClubId!: string;

  @ApiProperty({ example: '카동FC' })
  applicantClubName!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png', nullable: true })
  applicantClubLogoUrl!: string | null;

  @ApiProperty({ enum: ClubLevel })
  applicantClubLevel!: ClubLevel;

  @ApiPropertyOptional({ example: '잘 부탁드립니다!', nullable: true })
  message!: string | null;

  @ApiProperty({ example: '홍길동' })
  contactName!: string;

  @ApiProperty({ example: '010-1234-5678' })
  contactPhone!: string;

  @ApiProperty({ enum: MatchApplicationStatus, example: MatchApplicationStatus.PENDING })
  status!: MatchApplicationStatus;

  @ApiProperty({ example: '2026-04-15T10:00:00.000Z' })
  createdAt!: Date;
}

export class MatchApplicationListResponseDto {
  @ApiProperty({ type: [MatchApplicationItemResponseDto] })
  items!: MatchApplicationItemResponseDto[];
}

// ─── 내 신청 아이템 (신청팀 시점) ─────────────────────────────────────────────

export class MyApplicationItemResponseDto {
  @ApiProperty({ example: 'clx1234appId' })
  id!: string;

  @ApiProperty({ type: MatchPostSummaryResponseDto })
  post!: MatchPostSummaryResponseDto;

  @ApiProperty({ enum: MatchApplicationStatus })
  status!: MatchApplicationStatus;

  @ApiPropertyOptional({ example: '잘 부탁드립니다!', nullable: true })
  message!: string | null;

  @ApiProperty({ example: '2026-04-15T10:00:00.000Z' })
  createdAt!: Date;
}

export class MyApplicationListResponseDto {
  @ApiProperty({ type: [MyApplicationItemResponseDto] })
  items!: MyApplicationItemResponseDto[];
}

// ─── 연락처 ──────────────────────────────────────────────────────────────────

export class MatchContactResponseDto {
  @ApiProperty({ example: '홍길동', description: '상대팀 담당자 이름' })
  contactName!: string;

  @ApiProperty({ example: '010-1234-5678', description: '상대팀 연락처' })
  contactPhone!: string;
}
