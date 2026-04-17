import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchType } from '@prisma/client';

// ─── Feed Item ────────────────────────────────────────────────────────────────

export class MatchFeedItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: MatchType })
  type: MatchType;

  @ApiProperty()
  clubId: string;

  @ApiProperty()
  clubName: string;

  @ApiPropertyOptional({ nullable: true })
  clubLogoUrl: string | null;

  @ApiProperty()
  homeScore: number;

  @ApiProperty()
  awayScore: number;

  @ApiPropertyOptional({ nullable: true, description: 'LEAGUE 경기에만 존재' })
  opponentName: string | null;

  @ApiPropertyOptional({ nullable: true, description: '최다 득표 MOM 이름 (동점 시 첫 번째)' })
  momUserName: string | null;

  @ApiPropertyOptional({ nullable: true })
  momUserId: string | null;

  @ApiProperty({ description: '시도' })
  province: string;

  @ApiProperty({ description: '시군구' })
  district: string;

  @ApiProperty({ description: '경기장 이름' })
  location: string;

  @ApiProperty({ description: 'ISO 8601' })
  startAt: string;
}

export class MatchFeedPageResponseDto {
  @ApiProperty({ type: [MatchFeedItemResponseDto] })
  items: MatchFeedItemResponseDto[];

  @ApiPropertyOptional({ nullable: true })
  nextCursor: string | null;
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export class MatchGoalItemDto {
  @ApiProperty()
  scorerUserId: string;

  @ApiProperty()
  scorerUserName: string;

  @ApiPropertyOptional({ nullable: true })
  assistUserId: string | null;

  @ApiPropertyOptional({ nullable: true })
  assistUserName: string | null;

  @ApiPropertyOptional({ nullable: true })
  quarterNumber: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'SELF 경기 A/B 팀 구분' })
  team: string | null;
}

export class MomItemDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  voteCount: number;
}

export class MatchFeedDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: MatchType })
  type: MatchType;

  @ApiProperty()
  clubId: string;

  @ApiProperty()
  clubName: string;

  @ApiPropertyOptional({ nullable: true })
  clubLogoUrl: string | null;

  @ApiProperty()
  homeScore: number;

  @ApiProperty()
  awayScore: number;

  @ApiPropertyOptional({ nullable: true })
  opponentName: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'LEAGUE + matchPostId 있을 때만 non-null' })
  opponentClubId: string | null;

  @ApiProperty({ type: [MatchGoalItemDto] })
  goals: MatchGoalItemDto[];

  @ApiProperty({ type: [MomItemDto], description: '최다 득표자 (동점 시 복수)' })
  momList: MomItemDto[];

  @ApiProperty()
  participantCount: number;

  @ApiProperty()
  province: string;

  @ApiProperty()
  district: string;

  @ApiProperty()
  location: string;

  @ApiProperty({ description: 'ISO 8601' })
  startAt: string;
}
