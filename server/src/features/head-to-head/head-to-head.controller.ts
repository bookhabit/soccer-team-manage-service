import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { HeadToHeadService } from './head-to-head.service';
import { GetHeadToHeadDto } from './dto/get-head-to-head.dto';
import { HeadToHeadResponseDto } from './dto/head-to-head-response.dto';

@ApiTags('HeadToHead')
@ApiBearerAuth()
@Controller('clubs')
export class HeadToHeadController {
  constructor(private readonly headToHeadService: HeadToHeadService) {}

  @Get(':clubId/head-to-head/:opponentClubId')
  @ApiOperation({ summary: '두 클럽 간 상대 전적 조회 (커서 페이지네이션)' })
  @ApiResponse({ status: 200, type: HeadToHeadResponseDto, description: '요약 + 이력 반환' })
  @ApiResponse({ status: 403, description: 'H2H_001 — 해당 클럽 소속이 아님' })
  @ApiResponse({ status: 404, description: 'H2H_002 — 존재하지 않는 클럽' })
  getHeadToHead(
    @Param('clubId') clubId: string,
    @Param('opponentClubId') opponentClubId: string,
    @Query() dto: GetHeadToHeadDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<HeadToHeadResponseDto> {
    return this.headToHeadService.getHeadToHead(clubId, opponentClubId, user.sub, dto);
  }
}
