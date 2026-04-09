import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { ClubService } from './club.service';
import { CreateClubDto } from './dto/create-club.dto';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { JoinByCodeDto } from './dto/join-by-code.dto';
import { UpdateMemberStatsDto } from './dto/update-member-stats.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { TransferCaptainDto } from './dto/transfer-captain.dto';
import { LeaveClubDto } from './dto/leave-club.dto';
import { RespondDissolveVoteDto } from './dto/respond-dissolve-vote.dto';
import {
  ClubDetailResponseDto,
  ClubPreviewPageResponseDto,
  ClubMemberPageResponseDto,
  CreateJoinRequestResponseDto,
  JoinRequestPageResponseDto,
  InviteCodeResponseDto,
  DissolveVoteResponseDto,
} from './dto/club-response.dto';

@ApiTags('Clubs')
@ApiBearerAuth()
@Controller('api/v1/clubs')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  // ─── 클럽 CRUD ─────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: '클럽 생성' })
  @ApiResponse({ status: 201, type: ClubDetailResponseDto, description: '클럽 생성 성공 — 생성자에게 CAPTAIN 역할 자동 부여' })
  @ApiResponse({ status: 409, description: 'CLUB_ALREADY_MEMBER — 이미 소속된 팀 있음' })
  createClub(@CurrentUser() user: JwtPayload, @Body() dto: CreateClubDto) {
    return this.clubService.createClub(user.sub, dto);
  }

  @Get('my')
  @ApiOperation({ summary: '내 소속 클럽 조회' })
  @ApiResponse({ status: 200, type: ClubDetailResponseDto, description: '소속 클럽 반환 (없으면 null)' })
  getMyClub(@CurrentUser() user: JwtPayload) {
    return this.clubService.getMyClub(user.sub);
  }

  @Get('search')
  @ApiOperation({ summary: '클럽 검색' })
  @ApiResponse({ status: 200, type: ClubPreviewPageResponseDto })
  searchClubs(
    @Query('name') name?: string,
    @Query('regionId') regionId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.clubService.searchClubs({
      name,
      regionId,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('recommended')
  @ApiOperation({ summary: '추천 클럽 (선호 지역 기준)' })
  @ApiResponse({ status: 200, type: ClubPreviewPageResponseDto })
  getRecommended(
    @CurrentUser() user: JwtPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.clubService.getRecommendedClubs(user.sub, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('join-by-code')
  @ApiOperation({ summary: '초대 코드로 가입 신청' })
  @ApiResponse({ status: 201, description: '가입 신청 생성 성공' })
  @ApiResponse({ status: 404, description: 'CLUB_INVITE_CODE_INVALID' })
  @ApiResponse({ status: 410, description: 'CLUB_INVITE_CODE_EXPIRED' })
  @ApiResponse({ status: 409, description: 'CLUB_ALREADY_MEMBER / CLUB_JOIN_REQUEST_DUPLICATE' })
  joinByCode(@CurrentUser() user: JwtPayload, @Body() dto: JoinByCodeDto) {
    return this.clubService.joinByCode(user.sub, dto);
  }

  @Get(':clubId')
  @ApiOperation({ summary: '클럽 상세 조회' })
  @ApiResponse({ status: 200, type: ClubDetailResponseDto, description: 'myRole 포함 클럽 상세' })
  @ApiResponse({ status: 404, description: 'CLUB_NOT_FOUND' })
  getClubDetail(@Param('clubId') clubId: string, @CurrentUser() user: JwtPayload) {
    return this.clubService.getClubDetail(clubId, user.sub);
  }

  // ─── 팀원 관리 ─────────────────────────────────────────────────────────────

  @Get(':clubId/members')
  @ApiOperation({ summary: '팀원 목록 (커서 페이지네이션)' })
  @ApiResponse({ status: 200, type: ClubMemberPageResponseDto })
  getClubMembers(
    @Param('clubId') clubId: string,
    @CurrentUser() user: JwtPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('position') position?: string,
  ) {
    return this.clubService.getClubMembers(clubId, user.sub, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
      position,
    });
  }

  @Delete(':clubId/members/:targetUserId/kick')
  @ApiOperation({ summary: '팀원 강퇴 (주장·부주장)' })
  @ApiResponse({ status: 200, description: '강퇴 성공' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION' })
  kickMember(
    @Param('clubId') clubId: string,
    @Param('targetUserId') targetUserId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clubService.kickMember(clubId, user.sub, targetUserId);
  }

  @Patch(':clubId/members/:targetUserId/role')
  @ApiOperation({ summary: '역할 변경 (주장 전용)' })
  changeRole(
    @Param('clubId') clubId: string,
    @Param('targetUserId') targetUserId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangeRoleDto,
  ) {
    return this.clubService.changeRole(clubId, user.sub, targetUserId, dto);
  }

  @Patch(':clubId/members/:targetUserId/stats')
  @ApiOperation({ summary: '능력치 수정 (본인 또는 관리자)' })
  updateMemberStats(
    @Param('clubId') clubId: string,
    @Param('targetUserId') targetUserId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateMemberStatsDto,
  ) {
    return this.clubService.updateMemberStats(clubId, user.sub, targetUserId, dto);
  }

  @Post(':clubId/transfer-captain')
  @ApiOperation({ summary: '주장 권한 이전 (주장 전용)' })
  transferCaptain(
    @Param('clubId') clubId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: TransferCaptainDto,
  ) {
    return this.clubService.transferCaptain(clubId, user.sub, dto);
  }

  @Delete(':clubId/leave')
  @ApiOperation({ summary: '클럽 탈퇴' })
  @ApiResponse({ status: 403, description: 'CLUB_CAPTAIN_CANNOT_LEAVE — 주장은 권한 이전 후 탈퇴' })
  leaveClub(
    @Param('clubId') clubId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: LeaveClubDto,
  ) {
    return this.clubService.leaveClub(clubId, user.sub, dto);
  }

  // ─── 가입 신청 ─────────────────────────────────────────────────────────────

  @Post(':clubId/join-requests')
  @ApiOperation({ summary: '가입 신청' })
  @ApiResponse({ status: 201, type: CreateJoinRequestResponseDto })
  @ApiResponse({ status: 409, description: 'CLUB_ALREADY_MEMBER / CLUB_JOIN_REQUEST_DUPLICATE / CLUB_FULL' })
  @ApiResponse({ status: 403, description: 'CLUB_BANNED' })
  createJoinRequest(
    @Param('clubId') clubId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateJoinRequestDto,
  ) {
    return this.clubService.createJoinRequest(clubId, user.sub, dto);
  }

  @Delete(':clubId/join-requests/mine')
  @ApiOperation({ summary: '가입 신청 취소' })
  cancelJoinRequest(@Param('clubId') clubId: string, @CurrentUser() user: JwtPayload) {
    return this.clubService.cancelJoinRequest(clubId, user.sub);
  }

  @Get(':clubId/join-requests')
  @ApiOperation({ summary: '가입 신청 목록 (주장·부주장)' })
  @ApiResponse({ status: 200, type: JoinRequestPageResponseDto })
  getJoinRequests(
    @Param('clubId') clubId: string,
    @CurrentUser() user: JwtPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.clubService.getJoinRequests(clubId, user.sub, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch(':clubId/join-requests/:requestId/approve')
  @ApiOperation({ summary: '가입 신청 승인 (주장·부주장)' })
  approveJoinRequest(
    @Param('clubId') clubId: string,
    @Param('requestId') requestId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clubService.approveJoinRequest(clubId, user.sub, requestId);
  }

  @Patch(':clubId/join-requests/:requestId/reject')
  @ApiOperation({ summary: '가입 신청 거절 (주장·부주장)' })
  rejectJoinRequest(
    @Param('clubId') clubId: string,
    @Param('requestId') requestId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clubService.rejectJoinRequest(clubId, user.sub, requestId);
  }

  // ─── 초대 코드 ─────────────────────────────────────────────────────────────

  @Get(':clubId/invite-code')
  @ApiOperation({ summary: '초대 코드 조회 (주장·부주장)' })
  @ApiResponse({ status: 200, type: InviteCodeResponseDto })
  getInviteCode(@Param('clubId') clubId: string, @CurrentUser() user: JwtPayload) {
    return this.clubService.getInviteCode(clubId, user.sub);
  }

  @Post(':clubId/invite-code/renew')
  @ApiOperation({ summary: '초대 코드 재발급 (주장·부주장)' })
  @ApiResponse({ status: 201, type: InviteCodeResponseDto })
  renewInviteCode(@Param('clubId') clubId: string, @CurrentUser() user: JwtPayload) {
    return this.clubService.renewInviteCode(clubId, user.sub);
  }

  // ─── 해체 투표 ─────────────────────────────────────────────────────────────

  @Get(':clubId/dissolve-vote')
  @ApiOperation({ summary: '해체 투표 상태 조회' })
  @ApiResponse({ status: 200, type: DissolveVoteResponseDto })
  getDissolveVote(@Param('clubId') clubId: string, @CurrentUser() user: JwtPayload) {
    return this.clubService.getDissolveVote(clubId, user.sub);
  }

  @Post(':clubId/dissolve-vote')
  @ApiOperation({ summary: '해체 투표 시작 (주장 전용)' })
  @ApiResponse({ status: 201, type: DissolveVoteResponseDto })
  @ApiResponse({ status: 409, description: 'CLUB_DISSOLVE_VOTE_IN_PROGRESS' })
  startDissolveVote(@Param('clubId') clubId: string, @CurrentUser() user: JwtPayload) {
    return this.clubService.startDissolveVote(clubId, user.sub);
  }

  @Patch(':clubId/dissolve-vote/respond')
  @ApiOperation({ summary: '해체 투표 응답 (동의·거절)' })
  @ApiResponse({ status: 200, type: DissolveVoteResponseDto })
  @ApiResponse({ status: 410, description: 'CLUB_DISSOLVE_VOTE_EXPIRED' })
  respondDissolveVote(
    @Param('clubId') clubId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RespondDissolveVoteDto,
  ) {
    return this.clubService.respondDissolveVote(clubId, user.sub, dto);
  }
}
