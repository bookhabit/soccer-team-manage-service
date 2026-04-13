import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { MatchService } from './match.service';
import {
  AddParticipantDto,
  CreateCommentDto,
  CreateMatchDto,
  GetCommentsQueryDto,
  GetMatchesQueryDto,
  RegisterVideoDto,
  SaveLineupDto,
  SubmitAttendanceDto,
  SubmitMomVoteDto,
  SubmitOpponentRatingDto,
  SubmitRecordDto,
  UpdateMatchDto,
  UpdateRecordDto,
} from './dto/match.dto';
import {
  AttendanceItemResponseDto,
  CommentItemResponseDto,
  CommentPageResponseDto,
  MatchDetailResponseDto,
  MatchListResponseDto,
  MatchSummaryResponseDto,
  MomResultResponseDto,
  MomVoteResponseDto,
  OpponentRatingResponseDto,
  ParticipantResponseDto,
  QuarterResponseDto,
  RecordHistoryItemResponseDto,
  RecordResponseDto,
  SubmitAttendanceResponseDto,
  VideoResponseDto,
} from './dto/match-response.dto';

@ApiTags('Matches')
@ApiBearerAuth()
@Controller('clubs/:clubId/matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  // ─── 경기 CRUD ─────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: '경기 등록 (주장·부주장)' })
  @ApiResponse({ status: 201, type: MatchSummaryResponseDto, description: '경기 생성 성공' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 주장·부주장 아님' })
  createMatch(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Body() dto: CreateMatchDto,
  ) {
    return this.matchService.createMatch(clubId, user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: '경기 목록 (커서 페이지네이션)' })
  @ApiResponse({ status: 200, type: MatchListResponseDto, description: '내 투표 응답·참석/불참 수 포함' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 클럽 미소속' })
  getMatches(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Query() query: GetMatchesQueryDto,
  ) {
    return this.matchService.getMatches(clubId, user.sub, query);
  }

  @Get(':matchId')
  @ApiOperation({ summary: '경기 상세 (투표 현황·내 응답 포함)' })
  @ApiResponse({ status: 200, type: MatchDetailResponseDto, description: '참석·불참·미결정 인원 수 포함' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 클럽 미소속' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  getMatchDetail(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
  ) {
    return this.matchService.getMatchDetail(clubId, matchId, user.sub);
  }

  @Patch(':matchId')
  @ApiOperation({ summary: '경기 수정 (투표 마감 전만 허용, 주장·부주장)' })
  @ApiResponse({ status: 200, type: MatchSummaryResponseDto, description: '경기 수정 성공' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 주장·부주장 아님' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  @ApiResponse({ status: 422, description: 'MATCH_009 — 투표 마감 후 수정 불가' })
  updateMatch(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
    @Body() dto: UpdateMatchDto,
  ) {
    return this.matchService.updateMatch(clubId, matchId, user.sub, dto);
  }

  @Delete(':matchId')
  @ApiOperation({ summary: '경기 삭제 (소프트 삭제, 주장·부주장)' })
  @ApiResponse({ status: 200, description: '경기 삭제 성공' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 주장·부주장 아님' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  deleteMatch(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
  ) {
    return this.matchService.deleteMatch(clubId, matchId, user.sub);
  }

  // ─── 투표 응답 ─────────────────────────────────────────────────────────────

  @Post(':matchId/attendances')
  @ApiOperation({ summary: '출석 투표 제출 (upsert)' })
  @ApiResponse({ status: 201, type: SubmitAttendanceResponseDto, description: '투표 응답 저장 (중복 제출 시 덮어쓰기)' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 클럽 미소속' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  @ApiResponse({ status: 422, description: 'MATCH_003 — 투표 마감 후 변경 불가' })
  submitAttendance(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
    @Body() dto: SubmitAttendanceDto,
  ) {
    return this.matchService.submitAttendance(clubId, matchId, user.sub, dto);
  }

  @Get(':matchId/attendances')
  @ApiOperation({ summary: '투표 현황 목록' })
  @ApiResponse({ status: 200, type: [AttendanceItemResponseDto], description: '전체 팀원 투표 응답 목록' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 클럽 미소속' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  getAttendances(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
  ) {
    return this.matchService.getAttendances(clubId, matchId, user.sub);
  }

  // ─── 포지션 배정 ───────────────────────────────────────────────────────────

  @Get(':matchId/lineup')
  @ApiOperation({ summary: '포지션 배정 조회 (쿼터별)' })
  @ApiResponse({ status: 200, type: [QuarterResponseDto], description: '쿼터 번호·포메이션·팀·선수 배정 목록' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 클럽 미소속' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  getLineup(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
  ) {
    return this.matchService.getLineup(clubId, matchId, user.sub);
  }

  @Put(':matchId/lineup')
  @ApiOperation({ summary: '포지션 배정 저장 (전체 교체, 주장·부주장)' })
  @ApiResponse({ status: 200, type: [QuarterResponseDto], description: '저장된 전체 쿼터 라인업 반환' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 주장·부주장 아님' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기 / MATCH_010 — 참여 선수 목록에 없는 유저' })
  saveLineup(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
    @Body() dto: SaveLineupDto,
  ) {
    return this.matchService.saveLineup(clubId, matchId, user.sub, dto);
  }

  @Post(':matchId/participants')
  @ApiOperation({ summary: '참여 선수 수동 추가 (주장·부주장)' })
  @ApiResponse({ status: 201, type: ParticipantResponseDto, description: '참여 선수 추가 성공 (중복 추가 시 무시)' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 주장·부주장 아님 또는 대상이 클럽 미소속' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  addParticipant(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
    @Body() dto: AddParticipantDto,
  ) {
    return this.matchService.addParticipant(clubId, matchId, user.sub, dto.userId);
  }

  @Delete(':matchId/participants/:userId')
  @ApiOperation({ summary: '참여 선수 제거 (주장·부주장)' })
  @ApiResponse({ status: 200, description: '참여 선수 제거 성공' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 주장·부주장 아님' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  removeParticipant(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
    @Param('userId') targetId: string,
  ) {
    return this.matchService.removeParticipant(clubId, matchId, user.sub, targetId);
  }

  // ─── 경기 기록 ─────────────────────────────────────────────────────────────

  @Post(':matchId/record')
  @ApiOperation({ summary: '경기 기록 입력 (경기 종료 후, 주장·부주장)' })
  @ApiResponse({ status: 201, type: RecordResponseDto, description: '득점 기록 및 경기 결과 저장' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 주장·부주장 아님' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  @ApiResponse({ status: 422, description: 'MATCH_004 — 경기 종료 전 입력 불가' })
  submitRecord(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
    @Body() dto: SubmitRecordDto,
  ) {
    return this.matchService.submitRecord(clubId, matchId, user.sub, dto);
  }

  @Patch(':matchId/record')
  @ApiOperation({ summary: '경기 기록 수정 (이력 저장, 주장·부주장)' })
  @ApiResponse({ status: 200, type: RecordResponseDto, description: '수정 전·후 이력 저장 후 최신 기록 반환' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 주장·부주장 아님' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  updateRecord(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
    @Body() dto: UpdateRecordDto,
  ) {
    return this.matchService.updateRecord(clubId, matchId, user.sub, dto);
  }

  @Get(':matchId/record/histories')
  @ApiOperation({ summary: '기록 변경 이력 조회 (주장·부주장)' })
  @ApiResponse({ status: 200, type: [RecordHistoryItemResponseDto], description: '최신순 변경 이력 목록' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 주장·부주장 아님' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  getRecordHistories(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
  ) {
    return this.matchService.getRecordHistories(clubId, matchId, user.sub);
  }

  // ─── MOM 투표 ─────────────────────────────────────────────────────────────

  @Post(':matchId/mom-votes')
  @ApiOperation({ summary: 'MOM 투표 (1인 1표, 경기 당일 자정 마감)' })
  @ApiResponse({ status: 201, type: MomVoteResponseDto, description: 'MOM 투표 저장 성공' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 클럽 미소속' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  @ApiResponse({ status: 409, description: 'MATCH_006 — 이미 투표 완료' })
  @ApiResponse({ status: 422, description: 'MATCH_004 — 기록 미등록 / MATCH_005 — 투표 마감' })
  submitMomVote(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
    @Body() dto: SubmitMomVoteDto,
  ) {
    return this.matchService.submitMomVote(clubId, matchId, user.sub, dto);
  }

  @Get(':matchId/mom-votes/result')
  @ApiOperation({ summary: 'MOM 결과 (득표수·공동 수상 포함)' })
  @ApiResponse({ status: 200, type: MomResultResponseDto, description: '득표수 내림차순 정렬, 공동 수상자 모두 포함' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 클럽 미소속' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  getMomResult(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
  ) {
    return this.matchService.getMomResult(clubId, matchId, user.sub);
  }

  // ─── 댓글 ─────────────────────────────────────────────────────────────────

  @Get(':matchId/comments')
  @ApiOperation({ summary: '댓글 목록 (커서 페이지네이션, 오름차순)' })
  @ApiResponse({ status: 200, type: CommentPageResponseDto, description: '작성자 이름·아바타 포함' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 클럽 미소속' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  getComments(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
    @Query() query: GetCommentsQueryDto,
  ) {
    return this.matchService.getComments(clubId, matchId, user.sub, query);
  }

  @Post(':matchId/comments')
  @ApiOperation({ summary: '댓글 작성 (500자 제한)' })
  @ApiResponse({ status: 201, type: CommentItemResponseDto, description: '작성된 댓글 반환' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 클럽 미소속' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  createComment(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.matchService.createComment(clubId, matchId, user.sub, dto);
  }

  @Delete(':matchId/comments/:commentId')
  @ApiOperation({ summary: '댓글 삭제 (작성자 또는 주장·부주장)' })
  @ApiResponse({ status: 200, description: '댓글 삭제 성공' })
  @ApiResponse({ status: 403, description: 'MATCH_002 — 삭제 권한 없음' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기 또는 댓글' })
  deleteComment(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.matchService.deleteComment(clubId, matchId, commentId, user.sub);
  }

  // ─── 영상 ─────────────────────────────────────────────────────────────────

  @Post(':matchId/videos')
  @ApiOperation({ summary: '유튜브 영상 URL 등록' })
  @ApiResponse({ status: 201, type: VideoResponseDto, description: '등록된 영상 정보 반환' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 클럽 미소속' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  registerVideo(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
    @Body() dto: RegisterVideoDto,
  ) {
    return this.matchService.registerVideo(clubId, matchId, user.sub, dto);
  }

  @Delete(':matchId/videos/:videoId')
  @ApiOperation({ summary: '영상 삭제 (등록자 또는 주장·부주장)' })
  @ApiResponse({ status: 200, description: '영상 삭제 성공' })
  @ApiResponse({ status: 403, description: 'MATCH_002 — 삭제 권한 없음' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기 또는 영상' })
  deleteVideo(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
    @Param('videoId') videoId: string,
  ) {
    return this.matchService.deleteVideo(clubId, matchId, videoId, user.sub);
  }

  // ─── 상대팀 평가 ───────────────────────────────────────────────────────────

  @Post(':matchId/opponent-rating')
  @ApiOperation({ summary: '상대팀 평가 제출 (매칭전·기록 등록 후)' })
  @ApiResponse({ status: 201, type: OpponentRatingResponseDto, description: '상대팀 평가 저장 성공' })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 클럽 미소속' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  @ApiResponse({ status: 409, description: 'MATCH_008 — 이미 평가 완료' })
  @ApiResponse({ status: 422, description: 'MATCH_007 — 매칭전 아님 또는 기록 미등록' })
  submitOpponentRating(
    @CurrentUser() user: JwtPayload,
    @Param('clubId') clubId: string,
    @Param('matchId') matchId: string,
    @Body() dto: SubmitOpponentRatingDto,
  ) {
    return this.matchService.submitOpponentRating(clubId, matchId, user.sub, dto);
  }
}
