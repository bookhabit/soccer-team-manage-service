import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlayerPosition, PlayerFoot, PlayerLevel, Gender, AuthProvider, UserStatus } from '@prisma/client';

export class SignupResponseDto {
  @ApiProperty({ example: 'clx1234abcd' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string | null;

  @ApiProperty({ example: '홍길동' })
  name!: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date;
}

export class UserProfileResponseDto {
  @ApiProperty({ example: 'clx1234abcd' })
  id!: string;

  @ApiProperty({ enum: AuthProvider, example: AuthProvider.LOCAL })
  provider!: AuthProvider;

  @ApiPropertyOptional({ example: 'user@example.com', nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ example: '홍길동', nullable: true })
  name!: string | null;

  @ApiPropertyOptional({ example: 1995, nullable: true })
  birthYear!: number | null;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE, nullable: true })
  gender!: Gender | null;

  @ApiPropertyOptional({ enum: PlayerPosition, example: PlayerPosition.MF, nullable: true })
  position!: PlayerPosition | null;

  @ApiPropertyOptional({ enum: PlayerFoot, example: PlayerFoot.RIGHT, nullable: true })
  foot!: PlayerFoot | null;

  @ApiPropertyOptional({ example: 5, nullable: true })
  years!: number | null;

  @ApiPropertyOptional({ enum: PlayerLevel, example: PlayerLevel.AMATEUR, nullable: true })
  level!: PlayerLevel | null;

  @ApiPropertyOptional({ example: 'clx1234abcd', nullable: true })
  preferredRegionId!: string | null;

  @ApiPropertyOptional({ example: '010-1234-5678', nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png', nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ example: 100 })
  mannerScore!: number;

  @ApiProperty({ example: false })
  isOnboarded!: boolean;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  status!: UserStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date;
}
