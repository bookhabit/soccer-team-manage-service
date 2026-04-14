import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ClubLevel } from '@prisma/client';

// 마이그레이션 후 @prisma/client 에서 import 가능
enum MatchGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  MIXED = 'MIXED',
}

export class FilterMatchPostDto {
  @ApiPropertyOptional({ description: '커서 (다음 페이지 시작점)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: '페이지 크기 (기본 20)', example: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ description: '경기 날짜 시작 (ISO date)', example: '2026-05-01' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: '경기 날짜 끝 (ISO date)', example: '2026-05-31' })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({ description: '지역 ID' })
  @IsOptional()
  @IsString()
  regionId?: string;

  @ApiPropertyOptional({ enum: ClubLevel })
  @IsOptional()
  @IsEnum(ClubLevel)
  level?: ClubLevel;

  @ApiPropertyOptional({ enum: MatchGender })
  @IsOptional()
  @IsEnum(MatchGender)
  gender?: MatchGender;

  @ApiPropertyOptional({ description: 'true=유료만, false=무료만' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasFee?: boolean;

  @ApiPropertyOptional({ description: '만료 게시글 포함 여부 (기본 false)' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeExpired?: boolean;

  @ApiPropertyOptional({ description: '매칭완료 게시글 포함 여부 (기본 false)' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeMatched?: boolean;
}
