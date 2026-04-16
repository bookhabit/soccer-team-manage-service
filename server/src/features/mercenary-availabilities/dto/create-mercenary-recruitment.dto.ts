import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMercenaryRecruitmentDto {
  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  message?: string;

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
