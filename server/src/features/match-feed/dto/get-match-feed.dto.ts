import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetMatchFeedDto {
  @ApiPropertyOptional({ description: '커서 matchId' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: '페이지 크기 (기본 20, 최대 50)', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ description: '시도 (예: 서울특별시)' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: '시군구 (예: 은평구) — province 없으면 MATCH_FEED_001' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: '내 클럽 경기만 조회 (클럽 미소속 시 무시)' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  myClub?: boolean;

  @ApiPropertyOptional({ description: '내가 참가한 경기만 조회' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  myMatches?: boolean;

  @ApiPropertyOptional({ description: '조회 시작일 (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: '조회 종료일 (ISO 8601) — from~to 범위 6개월 초과 시 MATCH_FEED_002' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
