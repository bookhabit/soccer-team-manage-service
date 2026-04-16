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
import { MercenaryAvailabilitiesService } from './mercenary-availabilities.service';
import { NoShowReportsService } from './no-show-reports.service';
import { CreateMercenaryAvailabilityDto } from './dto/create-mercenary-availability.dto';
import { UpdateMercenaryAvailabilityDto } from './dto/update-mercenary-availability.dto';
import { FilterMercenaryAvailabilityDto } from './dto/filter-mercenary-availability.dto';
import { CreateMercenaryRecruitmentDto } from './dto/create-mercenary-recruitment.dto';
import { CreateNoShowReportDto } from './dto/create-no-show-report.dto';

@ApiTags('MercenaryAvailabilities')
@ApiBearerAuth()
@Controller('mercenary-availabilities')
export class MercenaryAvailabilitiesController {
  constructor(
    private readonly service: MercenaryAvailabilitiesService,
    private readonly noShowService: NoShowReportsService,
  ) {}

  // ─── 전체 목록 ────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: '용병 가능 목록 (필터 + 커서 페이지네이션)' })
  @ApiResponse({ status: 200, description: '{ items, nextCursor }' })
  getList(
    @Query() dto: FilterMercenaryAvailabilityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.getList(user.sub, dto);
  }

  // ─── 내 게시글 ────────────────────────────────────────────────────────────

  @Get('my')
  @ApiOperation({ summary: '내 용병 가능 게시글 목록' })
  @ApiResponse({ status: 200, description: '{ items }' })
  getMyAvailabilities(@CurrentUser() user: JwtPayload) {
    return this.service.getMyAvailabilities(user.sub);
  }

  // ─── 내가 받은 영입 신청 ──────────────────────────────────────────────────

  @Get('my-recruitments')
  @ApiOperation({ summary: '내가 받은 영입 신청 목록' })
  @ApiResponse({ status: 200, description: '{ items }' })
  getMyRecruitments(@CurrentUser() user: JwtPayload) {
    return this.service.getMyRecruitments(user.sub);
  }

  // ─── 상세 ──────────────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: '용병 가능 게시글 상세' })
  @ApiResponse({ status: 200, description: 'MercenaryAvailabilityDetail' })
  @ApiResponse({ status: 404, description: 'MERCENARY_AVAIL_001' })
  getDetail(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.getDetail(id, user.sub);
  }

  // ─── 등록 ──────────────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '용병 가능 게시글 등록' })
  @ApiResponse({ status: 201, description: '{ id }' })
  @ApiResponse({ status: 403, description: 'MERCENARY_BLACKLIST' })
  create(
    @Body() dto: CreateMercenaryAvailabilityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(user.sub, dto);
  }

  // ─── 수정 ──────────────────────────────────────────────────────────────────

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '용병 가능 게시글 수정 (등록자, 만료 전)' })
  @ApiResponse({ status: 204, description: '수정 완료' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMercenaryAvailabilityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.update(id, user.sub, dto);
  }

  // ─── 삭제 ──────────────────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '용병 가능 게시글 soft delete (등록자)' })
  @ApiResponse({ status: 204, description: '삭제 완료' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.softDelete(id, user.sub);
  }

  // ─── 영입 신청 ────────────────────────────────────────────────────────────

  @Post(':id/recruitments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '영입 신청 (팀 → 개인)' })
  @ApiResponse({ status: 201, description: '신청 완료' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION | MERCENARY_AVAIL_005 | MERCENARY_BLACKLIST' })
  @ApiResponse({ status: 409, description: 'MERCENARY_AVAIL_004 — 중복 신청' })
  @ApiResponse({ status: 410, description: 'MERCENARY_AVAIL_003 — 만료' })
  async recruit(
    @Param('id') id: string,
    @Body() dto: CreateMercenaryRecruitmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.recruit(id, user.sub, dto);
  }

  // ─── 영입 신청 수락 ───────────────────────────────────────────────────────

  @Patch(':id/recruitments/:recId/accept')
  @ApiOperation({ summary: '영입 신청 수락 (게시글 등록자)' })
  @ApiResponse({ status: 200, description: '{ contact: { player, club } }' })
  acceptRecruitment(
    @Param('id') id: string,
    @Param('recId') recId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.acceptRecruitment(id, recId, user.sub);
  }

  // ─── 영입 신청 거절 ───────────────────────────────────────────────────────

  @Patch(':id/recruitments/:recId/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '영입 신청 거절 (게시글 등록자)' })
  @ApiResponse({ status: 204, description: '거절 완료' })
  async rejectRecruitment(
    @Param('id') id: string,
    @Param('recId') recId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.rejectRecruitment(id, recId, user.sub);
  }
}

@ApiTags('NoShowReports')
@ApiBearerAuth()
@Controller('no-show-reports')
export class NoShowReportsController {
  constructor(private readonly noShowService: NoShowReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '노쇼 신고 등록' })
  @ApiResponse({ status: 201, description: '신고 접수 완료' })
  @ApiResponse({ status: 403, description: 'NO_SHOW_REPORT_001' })
  @ApiResponse({ status: 409, description: 'NO_SHOW_REPORT_003 — 중복 신고' })
  @ApiResponse({ status: 422, description: 'NO_SHOW_REPORT_002 — 경기 전 신고 불가' })
  async create(
    @Body() dto: CreateNoShowReportDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.noShowService.create(user.sub, dto);
  }
}
