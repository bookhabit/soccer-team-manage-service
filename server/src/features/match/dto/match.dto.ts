import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AttendanceResponse, ClubLevel, FormationSlot, MatchType } from '@prisma/client';
import { PartialType } from '@nestjs/swagger';

// ─── Match ────────────────────────────────────────────────────────────────────

export class CreateMatchDto {
  @ApiProperty({ enum: MatchType })
  @IsEnum(MatchType)
  type!: MatchType;

  @ApiProperty({ example: 'vs 카동FC' })
  @IsString()
  @MaxLength(100)
  title!: string;

  @ApiProperty({ example: '서울 월드컵경기장' })
  @IsString()
  @MaxLength(100)
  location!: string;

  @ApiPropertyOptional({ example: '서울특별시 마포구 월드컵로 240' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiProperty({ example: '2026-04-15T10:00:00.000Z' })
  @IsISO8601()
  startAt!: string;

  @ApiProperty({ example: '2026-04-15T12:00:00.000Z' })
  @IsISO8601()
  endAt!: string;

  @ApiProperty({ example: '2026-04-14T23:59:00.000Z' })
  @IsISO8601()
  voteDeadline!: string;

  @ApiPropertyOptional({ example: '카동FC' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  opponentName?: string;

  @ApiPropertyOptional({ enum: ClubLevel })
  @IsOptional()
  @IsEnum(ClubLevel)
  opponentLevel?: ClubLevel;
}

export class UpdateMatchDto extends PartialType(CreateMatchDto) {}

// ─── Attendance ───────────────────────────────────────────────────────────────

export class SubmitAttendanceDto {
  @ApiProperty({ enum: AttendanceResponse })
  @IsEnum(AttendanceResponse)
  response!: AttendanceResponse;
}

// ─── Lineup ───────────────────────────────────────────────────────────────────

export class AssignmentItemDto {
  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiProperty({ enum: FormationSlot, description: '포메이션 슬롯 (예: LCM, RWB, ST, GK)' })
  @IsEnum(FormationSlot)
  position!: FormationSlot;
}

export class SaveQuarterDto {
  @ApiProperty({ minimum: 1, maximum: 6 })
  @IsInt()
  @Min(1)
  @Max(6)
  quarterNumber!: number;

  @ApiProperty({ example: '4-3-3' })
  @IsString()
  @MaxLength(20)
  formation!: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  team?: string;

  @ApiProperty({ type: [AssignmentItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentItemDto)
  assignments!: AssignmentItemDto[];
}

export class SaveLineupDto {
  @ApiProperty({ type: [SaveQuarterDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveQuarterDto)
  quarters!: SaveQuarterDto[];
}

export class AddParticipantDto {
  @ApiProperty()
  @IsString()
  userId!: string;
}

// ─── Record ───────────────────────────────────────────────────────────────────

export class GoalItemDto {
  @ApiProperty()
  @IsString()
  scorerUserId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assistUserId?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 6 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  quarterNumber?: number;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  team?: string;
}

export class SubmitRecordDto {
  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  homeScore!: number;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  awayScore!: number;

  @ApiProperty({ type: [GoalItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoalItemDto)
  goals!: GoalItemDto[];
}

export class UpdateRecordDto extends PartialType(SubmitRecordDto) {}

// ─── MOM Vote ─────────────────────────────────────────────────────────────────

export class SubmitMomVoteDto {
  @ApiProperty()
  @IsString()
  targetUserId!: string;
}

// ─── Comment ─────────────────────────────────────────────────────────────────

export class CreateCommentDto {
  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MaxLength(500, { message: '댓글은 최대 500자입니다.' })
  content!: string;
}

// ─── Video ────────────────────────────────────────────────────────────────────

export class RegisterVideoDto {
  @ApiProperty({ example: 'https://www.youtube.com/watch?v=xxx' })
  @IsUrl()
  youtubeUrl!: string;
}

// ─── Opponent Rating ──────────────────────────────────────────────────────────

export class SubmitOpponentRatingDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  score!: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  review?: string;

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mvpName?: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export class GetMatchesQueryDto {
  @ApiPropertyOptional({ enum: MatchType })
  @IsOptional()
  @IsEnum(MatchType)
  type?: MatchType;

  @ApiPropertyOptional({ description: '내가 뛴 경기만 (MatchParticipant 기준)' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  myMatches?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;
}

export class GetCommentsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;
}
