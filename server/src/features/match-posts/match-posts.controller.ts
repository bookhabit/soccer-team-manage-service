import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { MatchPostsService } from './match-posts.service';
import { CreateMatchPostDto } from './dto/create-match-post.dto';
import { UpdateMatchPostDto } from './dto/update-match-post.dto';
import { FilterMatchPostDto } from './dto/filter-match-post.dto';
import { CreateMatchApplicationDto } from './dto/create-match-application.dto';
import {
  MatchApplicationItemResponseDto,
  MatchApplicationListResponseDto,
  MatchContactResponseDto,
  MatchPostDetailResponseDto,
  MatchPostListResponseDto,
  MatchPostSummaryResponseDto,
  MyApplicationListResponseDto,
} from './dto/match-post-response.dto';

@ApiTags('MatchPosts')
@ApiBearerAuth()
@Controller('match-posts')
export class MatchPostsController {
  constructor(private readonly matchPostsService: MatchPostsService) {}

  // ─── 전체 목록 ────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: '매칭 게시글 전체 목록 (필터 + 커서 페이지네이션)' })
  @ApiResponse({ status: 200, type: MatchPostListResponseDto })
  async getList(
    @Query() dto: FilterMatchPostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.matchPostsService.getList(user.sub, dto);
  }

  // ─── 내 팀 게시글 ─────────────────────────────────────────────────────────

  @Get('my')
  @ApiOperation({ summary: '내 팀 매칭 게시글 목록 (관리자)' })
  @ApiResponse({ status: 200, description: '{ items: MatchPostSummaryResponseDto[] }' })
  async getMyPosts(@CurrentUser() user: JwtPayload) {
    return this.matchPostsService.getMyPosts(user.sub);
  }

  // ─── 내 신청 목록 ─────────────────────────────────────────────────────────

  @Get('my-applications')
  @ApiOperation({ summary: '내 팀이 신청한 매칭 목록 (관리자)' })
  @ApiResponse({ status: 200, type: MyApplicationListResponseDto })
  async getMyApplications(@CurrentUser() user: JwtPayload) {
    return this.matchPostsService.getMyApplications(user.sub);
  }

  // ─── 상세 ──────────────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: '매칭 게시글 상세' })
  @ApiResponse({ status: 200, type: MatchPostDetailResponseDto })
  @ApiResponse({ status: 404, description: 'MATCH_POST_001 — 존재하지 않는 게시글' })
  async getDetail(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.matchPostsService.getDetail(id, user.sub);
  }

  // ─── 등록 ──────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: '매칭 게시글 등록 (주장·부주장)' })
  @ApiResponse({ status: 201, type: MatchPostSummaryResponseDto })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 주장·부주장 아님' })
  async create(
    @Body() dto: CreateMatchPostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.matchPostsService.create(user.sub, dto);
  }

  // ─── 수정 ──────────────────────────────────────────────────────────────────

  @Patch(':id')
  @ApiOperation({ summary: '매칭 게시글 수정 (OPEN 상태만)' })
  @ApiResponse({ status: 200, type: MatchPostSummaryResponseDto })
  @ApiResponse({ status: 403, description: 'MATCH_POST_002 — 수정 권한 없음' })
  @ApiResponse({ status: 409, description: 'MATCH_POST_003 — 매칭 완료 후 수정 불가' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMatchPostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.matchPostsService.update(id, user.sub, dto);
  }

  // ─── 삭제 ──────────────────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '매칭 게시글 soft delete (등록자)' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 403, description: 'MATCH_POST_002 — 삭제 권한 없음' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.matchPostsService.softDelete(id, user.sub);
  }

  // ─── 연락처 조회 (Rate Limit) ────────────────────────────────────────────

  @Get(':id/contact')
  @Throttle({ default: { limit: 20, ttl: 86400000 } })
  @ApiOperation({ summary: '수락 후 연락처 조회 (관계자 + Rate Limit 20회/일)' })
  @ApiResponse({ status: 200, type: MatchContactResponseDto })
  @ApiResponse({ status: 403, description: 'MATCH_POST_008 또는 MATCH_POST_009' })
  async getContact(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.matchPostsService.getContact(id, user.sub);
  }

  // ─── 매칭 신청 ───────────────────────────────────────────────────────────

  @Post(':id/applications')
  @ApiOperation({ summary: '매칭 신청 (상대팀 주장·부주장)' })
  @ApiResponse({ status: 201, type: MatchApplicationItemResponseDto })
  @ApiResponse({ status: 403, description: 'MATCH_POST_005 — 본인 팀 게시글 신청 불가' })
  @ApiResponse({ status: 409, description: 'MATCH_POST_006 — 이미 신청함 / MATCH_POST_003 — 매칭 완료' })
  @ApiResponse({ status: 410, description: 'MATCH_POST_004 — 만료된 게시글' })
  async apply(
    @Param('id') postId: string,
    @Body() dto: CreateMatchApplicationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.matchPostsService.apply(postId, user.sub, dto);
  }

  // ─── 신청 목록 ────────────────────────────────────────────────────────────

  @Get(':id/applications')
  @ApiOperation({ summary: '신청 목록 조회 (게시글 등록자)' })
  @ApiResponse({ status: 200, type: MatchApplicationListResponseDto })
  @ApiResponse({ status: 403, description: 'MATCH_POST_007 — 조회 권한 없음' })
  async getApplications(
    @Param('id') postId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.matchPostsService.getApplications(postId, user.sub);
  }

  // ─── 신청 수락 ────────────────────────────────────────────────────────────

  @Patch(':id/applications/:appId/accept')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '신청 수락 — 트랜잭션 (등록자)' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 409, description: 'MATCH_APPLICATION_002 — 이미 처리됨 / MATCH_POST_003 — 이미 매칭완료' })
  async accept(
    @Param('id') postId: string,
    @Param('appId') appId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.matchPostsService.accept(postId, appId, user.sub);
  }

  // ─── 신청 거절 ────────────────────────────────────────────────────────────

  @Patch(':id/applications/:appId/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '신청 거절 (등록자)' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 409, description: 'MATCH_APPLICATION_002 — 이미 처리됨' })
  async reject(
    @Param('id') postId: string,
    @Param('appId') appId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.matchPostsService.reject(postId, appId, user.sub);
  }
}
