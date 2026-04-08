import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ClubRole } from '@prisma/client';

export class ChangeRoleDto {
  @ApiProperty({ enum: ['VICE_CAPTAIN', 'MEMBER'], example: 'VICE_CAPTAIN' })
  @IsEnum(['VICE_CAPTAIN', 'MEMBER'])
  role!: Extract<ClubRole, 'VICE_CAPTAIN' | 'MEMBER'>;
}
