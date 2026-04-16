import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClubLevel, PlayerPosition } from '@prisma/client';

export class CreateMercenaryPostDto {
  @ApiProperty({ enum: PlayerPosition, isArray: true })
  @IsArray()
  @IsEnum(PlayerPosition, { each: true })
  positions: PlayerPosition[];

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(20)
  requiredCount: number;

  @ApiProperty({ example: '2026-05-01T00:00:00.000Z' })
  @IsDateString()
  matchDate: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime: string;

  @ApiProperty({ example: '20:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  location: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiProperty()
  @IsString()
  regionId: string;

  @ApiProperty({ enum: ClubLevel })
  @IsEnum(ClubLevel)
  level: ClubLevel;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  fee: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  contactName: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  contactPhone: string;
}
