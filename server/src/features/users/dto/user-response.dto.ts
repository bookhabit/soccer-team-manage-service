import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlayerPosition } from '@prisma/client';

export class SignupResponseDto {
  @ApiProperty({ example: 'clx1234abcd' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: '홍길동' })
  nickname!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date;
}

export class UserProfileResponseDto {
  @ApiProperty({ example: 'clx1234abcd' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: '홍길동' })
  nickname!: string;

  @ApiPropertyOptional({ enum: PlayerPosition, example: PlayerPosition.MF, nullable: true })
  position!: PlayerPosition | null;

  @ApiProperty({ example: 3 })
  skillLevel!: number;
}
