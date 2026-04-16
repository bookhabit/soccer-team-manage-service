import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { MatchFeedService } from './match-feed.service';
import { GetMatchFeedDto } from './dto/get-match-feed.dto';
import {
  MatchFeedDetailResponseDto,
  MatchFeedPageResponseDto,
} from './dto/match-feed-response.dto';

@ApiTags('MatchFeed')
@ApiBearerAuth()
@Controller('match-feed')
export class MatchFeedController {
  constructor(private readonly matchFeedService: MatchFeedService) {}

  @Get()
  @ApiOperation({ summary: '경기 결과 피드 목록 조회 (커서 페이지네이션)' })
  @ApiResponse({ status: 200, type: MatchFeedPageResponseDto, description: '피드 목록 반환' })
  @ApiResponse({ status: 400, description: 'MATCH_FEED_001 — district만 단독 사용 불가 | MATCH_FEED_002 — 날짜 범위 6개월 초과' })
  getFeed(
    @Query() dto: GetMatchFeedDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<MatchFeedPageResponseDto> {
    return this.matchFeedService.getFeed(dto, user.sub);
  }

  @Get(':matchId')
  @ApiOperation({ summary: '경기 공개 결과 상세 조회' })
  @ApiResponse({ status: 200, type: MatchFeedDetailResponseDto, description: '경기 상세 반환' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  getDetail(
    @Param('matchId') matchId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<MatchFeedDetailResponseDto> {
    return this.matchFeedService.getDetail(matchId, user.sub);
  }
}
