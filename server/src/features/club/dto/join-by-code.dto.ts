import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class JoinByCodeDto {
  @ApiProperty({ example: 'A1B2C3D4' })
  @IsString()
  @Length(6, 12, { message: '초대 코드 형식이 올바르지 않습니다.' })
  code!: string;
}
