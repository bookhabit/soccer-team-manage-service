import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum LeaveReason {
  TIME_CONFLICT = 'TIME_CONFLICT',
  MOVING_TEAM = 'MOVING_TEAM',
  QUIT_SOCCER = 'QUIT_SOCCER',
  BAD_ATMOSPHERE = 'BAD_ATMOSPHERE',
  OTHER = 'OTHER',
}

export class LeaveClubDto {
  @ApiProperty({ enum: LeaveReason })
  @IsEnum(LeaveReason)
  reason!: LeaveReason;
}
