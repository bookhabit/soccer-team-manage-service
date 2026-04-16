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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { MercenaryPostsService } from './mercenary-posts.service';
import { CreateMercenaryPostDto } from './dto/create-mercenary-post.dto';
import { UpdateMercenaryPostDto } from './dto/update-mercenary-post.dto';
import { FilterMercenaryPostDto } from './dto/filter-mercenary-post.dto';
import { CreateMercenaryApplicationDto } from './dto/create-mercenary-application.dto';

@ApiTags('MercenaryPosts')
@ApiBearerAuth()
@Controller('mercenary-posts')
export class MercenaryPostsController {
  constructor(private readonly service: MercenaryPostsService) {}

  // ─── 전체 목록 ────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: '용병 구함 목록 (필터 + 커서 페이지네이션)' })
  @ApiResponse({ status: 200, description: '{ items, nextCursor }' })
  getList(
    @Query() dto: FilterMercenaryPostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.getList(user.sub, dto);
  }

  // ─── 내 팀 게시글 ─────────────────────────────────────────────────────────

  @Get('my')
  @ApiOperation({ summary: '내 팀 용병 구함 게시글 목록 (관리자)' })
  @ApiResponse({ status: 200, description: '{ items }' })
  getMyPosts(@CurrentUser() user: JwtPayload) {
    return this.service.getMyPosts(user.sub);
  }

  // ─── 상세 ──────────────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: '용병 구함 게시글 상세' })
  @ApiResponse({ status: 200, description: 'MercenaryPostDetail' })
  @ApiResponse({ status: 404, description: 'MERCENARY_POST_001' })
  getDetail(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.getDetail(id, user.sub);
  }

  // ─── 등록 ──────────────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '용병 구함 게시글 등록 (관리자)' })
  @ApiResponse({ status: 201, description: '{ id }' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION | MERCENARY_BLACKLIST' })
  create(
    @Body() dto: CreateMercenaryPostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(user.sub, dto);
  }

  // ─── 수정 ──────────────────────────────────────────────────────────────────

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '용병 구함 게시글 수정 (OPEN 상태, 등록자)' })
  @ApiResponse({ status: 204, description: '수정 완료' })
  @ApiResponse({ status: 409, description: 'MERCENARY_POST_003 — OPEN 상태 아님' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMercenaryPostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.update(id, user.sub, dto);
  }

  // ─── 삭제 ──────────────────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '용병 구함 게시글 soft delete (등록자)' })
  @ApiResponse({ status: 204, description: '삭제 완료' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.softDelete(id, user.sub);
  }

  // ─── 입단 신청 ────────────────────────────────────────────────────────────

  @Post(':id/applications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '입단 신청 (개인 → 팀)' })
  @ApiResponse({ status: 201, description: '신청 완료' })
  @ApiResponse({ status: 403, description: 'MERCENARY_POST_005 | MERCENARY_BLACKLIST' })
  @ApiResponse({ status: 409, description: 'MERCENARY_POST_003 | MERCENARY_POST_006' })
  @ApiResponse({ status: 410, description: 'MERCENARY_POST_004 — 만료' })
  async apply(
    @Param('id') id: string,
    @Body() dto: CreateMercenaryApplicationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.apply(id, user.sub, dto);
  }

  // ─── 지원자 목록 ─────────────────────────────────────────────────────────

  @Get(':id/applications')
  @ApiOperation({ summary: '지원자 목록 조회 (등록팀 관리자)' })
  @ApiResponse({ status: 200, description: '{ items }' })
  @ApiResponse({ status: 403, description: 'MERCENARY_POST_007' })
  getApplications(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.getApplications(id, user.sub);
  }

  // ─── 신청 수락 ────────────────────────────────────────────────────────────

  @Patch(':id/applications/:appId/accept')
  @ApiOperation({ summary: '입단 신청 수락 (등록팀 관리자)' })
  @ApiResponse({ status: 200, description: '{ contact: { applicant, postCreator } }' })
  @ApiResponse({ status: 409, description: 'MERCENARY_APP_002 — 이미 처리됨' })
  accept(
    @Param('id') id: string,
    @Param('appId') appId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.accept(id, appId, user.sub);
  }

  // ─── 신청 거절 ────────────────────────────────────────────────────────────

  @Patch(':id/applications/:appId/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '입단 신청 거절 (등록팀 관리자)' })
  @ApiResponse({ status: 204, description: '거절 완료' })
  @ApiResponse({ status: 409, description: 'MERCENARY_APP_002 — 이미 처리됨' })
  async reject(
    @Param('id') id: string,
    @Param('appId') appId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.reject(id, appId, user.sub);
  }
}
