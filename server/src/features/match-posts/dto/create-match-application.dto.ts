import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMatchApplicationDto {
  @ApiPropertyOptional({ example: '잘 부탁드립니다!', description: '신청 메시지 (최대 100자)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  message?: string;

  @ApiProperty({ example: '홍길동', description: '담당자 이름' })
  @IsString()
  @MaxLength(50)
  contactName!: string;

  @ApiProperty({ example: '010-1234-5678', description: '연락처' })
  @IsString()
  @MaxLength(20)
  contactPhone!: string;
}
