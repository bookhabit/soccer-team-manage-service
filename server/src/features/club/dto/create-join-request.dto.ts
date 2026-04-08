import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateJoinRequestDto {
  @ApiPropertyOptional({ example: '안녕하세요, 팀에 합류하고 싶습니다.', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '신청 메시지는 최대 500자입니다.' })
  message?: string;
}
