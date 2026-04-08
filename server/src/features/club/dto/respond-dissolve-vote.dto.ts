import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class RespondDissolveVoteDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  agreed!: boolean;
}
