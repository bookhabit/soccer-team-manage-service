import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlayerPosition } from '@prisma/client';

export class CreateMercenaryAvailabilityDto {
  @ApiProperty({ enum: PlayerPosition, isArray: true })
  @IsArray()
  @IsEnum(PlayerPosition, { each: true })
  positions: PlayerPosition[];

  @ApiProperty({ isArray: true, example: ['2026-05-01T00:00:00.000Z'] })
  @IsArray()
  @IsDateString({}, { each: true })
  availableDates: string[];

  @ApiProperty({ isArray: true })
  @IsArray()
  @IsString({ each: true })
  regionIds: string[];

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timeSlot?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  acceptsFee: boolean;
}
