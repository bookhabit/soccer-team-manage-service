import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WithdrawReason {
  TIME_CONFLICT = 'TIME_CONFLICT',
  MOVING_TEAM = 'MOVING_TEAM',
  QUITTING_SOCCER = 'QUITTING_SOCCER',
  BAD_ATMOSPHERE = 'BAD_ATMOSPHERE',
  OTHER = 'OTHER',
}

export class WithdrawDto {
  @ApiProperty({ enum: WithdrawReason, example: WithdrawReason.OTHER })
  @IsEnum(WithdrawReason, { message: '올바른 탈퇴 사유를 선택해주세요.' })
  reason!: WithdrawReason;
}
