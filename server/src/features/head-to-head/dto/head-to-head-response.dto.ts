import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HeadToHeadSummaryDto {
  @ApiProperty()
  myClubId: string;

  @ApiProperty()
  opponentClubId: string;

  @ApiProperty()
  myClubName: string;

  @ApiProperty()
  opponentClubName: string;

  @ApiProperty()
  wins: number;

  @ApiProperty()
  draws: number;

  @ApiProperty()
  losses: number;

  @ApiProperty()
  goalsFor: number;

  @ApiProperty()
  goalsAgainst: number;
}

export class HeadToHeadHistoryItemDto {
  @ApiProperty()
  matchId: string;

  @ApiProperty({ description: 'ISO 8601' })
  date: string;

  @ApiProperty()
  myScore: number;

  @ApiProperty()
  opponentScore: number;

  @ApiProperty({ enum: ['WIN', 'DRAW', 'LOSS'] })
  result: 'WIN' | 'DRAW' | 'LOSS';
}

export class HeadToHeadResponseDto {
  @ApiProperty({ type: HeadToHeadSummaryDto })
  summary: HeadToHeadSummaryDto;

  @ApiProperty({ type: [HeadToHeadHistoryItemDto] })
  history: HeadToHeadHistoryItemDto[];

  @ApiPropertyOptional({ nullable: true })
  nextCursor: string | null;

  @ApiProperty()
  hasNextPage: boolean;
}
