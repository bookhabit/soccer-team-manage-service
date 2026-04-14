import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceResponse, ClubLevel, FormationSlot, MatchType } from '@prisma/client';

// ─── 경기 요약 (목록·생성·수정 공통) ──────────────────────────────────────────

export class MatchSummaryResponseDto {
  @ApiProperty({ example: 'clx1234matchId' })
  id!: string;

  @ApiProperty({ enum: MatchType, example: MatchType.LEAGUE })
  type!: MatchType;

  @ApiProperty({ example: 'vs 카동FC' })
  title!: string;

  @ApiProperty({ example: '서울 월드컵경기장' })
  location!: string;

  @ApiPropertyOptional({ example: '서울특별시 마포구 월드컵로 240', nullable: true })
  address!: string | null;

  @ApiProperty({ example: '2026-04-15T10:00:00.000Z' })
  startAt!: Date;

  @ApiProperty({ example: '2026-04-15T12:00:00.000Z' })
  endAt!: Date;

  @ApiProperty({ example: '2026-04-14T23:59:00.000Z' })
  voteDeadline!: Date;

  @ApiPropertyOptional({ example: '카동FC', nullable: true })
  opponentName!: string | null;

  @ApiPropertyOptional({ enum: ClubLevel, nullable: true })
  opponentLevel!: ClubLevel | null;

  @ApiPropertyOptional({ example: 2, nullable: true })
  homeScore!: number | null;

  @ApiPropertyOptional({ example: 1, nullable: true })
  awayScore!: number | null;

  @ApiProperty({ example: false })
  isRecordSubmitted!: boolean;
}

// ─── 경기 목록 아이템 (투표 요약 포함) ─────────────────────────────────────────

export class MatchListItemResponseDto extends MatchSummaryResponseDto {
  @ApiPropertyOptional({ enum: AttendanceResponse, nullable: true, description: '내 출석 응답' })
  myResponse!: AttendanceResponse | null;

  @ApiProperty({ example: 8, description: '참석 인원 수' })
  attendCount!: number;

  @ApiProperty({ example: 3, description: '불참 인원 수' })
  absentCount!: number;
}

export class MatchListResponseDto {
  @ApiProperty({ type: [MatchListItemResponseDto] })
  items!: MatchListItemResponseDto[];

  @ApiPropertyOptional({ example: 'clx1234cursor', nullable: true })
  nextCursor!: string | null;
}

// ─── 경기 상세 ─────────────────────────────────────────────────────────────────

export class MatchDetailResponseDto extends MatchSummaryResponseDto {
  @ApiPropertyOptional({ example: '2026-04-15T14:00:00.000Z', nullable: true })
  recordedAt!: Date | null;

  @ApiPropertyOptional({ enum: AttendanceResponse, nullable: true, description: '내 출석 응답' })
  myResponse!: AttendanceResponse | null;

  @ApiProperty({ example: 8, description: '참석 인원 수' })
  attendCount!: number;

  @ApiProperty({ example: 3, description: '불참 인원 수' })
  absentCount!: number;

  @ApiProperty({ example: 2, description: '미결정 인원 수' })
  undecidedCount!: number;
}

// ─── 투표 응답 ─────────────────────────────────────────────────────────────────

export class SubmitAttendanceResponseDto {
  @ApiProperty({ example: 'clx1234attendanceId' })
  id!: string;

  @ApiProperty({ example: 'clx1234matchId' })
  matchId!: string;

  @ApiProperty({ example: 'clx1234userId' })
  userId!: string;

  @ApiProperty({ enum: AttendanceResponse, example: AttendanceResponse.ATTEND })
  response!: AttendanceResponse;

  @ApiProperty({ example: '2026-04-13T12:00:00.000Z' })
  updatedAt!: Date;
}

export class AttendanceAuthorDto {
  @ApiProperty({ example: '홍길동' })
  name!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png', nullable: true })
  avatarUrl!: string | null;
}

export class AttendanceItemResponseDto {
  @ApiProperty({ example: 'clx1234userId' })
  userId!: string;

  @ApiProperty({ enum: AttendanceResponse, example: AttendanceResponse.ATTEND })
  response!: AttendanceResponse;

  @ApiProperty({ type: AttendanceAuthorDto })
  user!: AttendanceAuthorDto;
}

// ─── 라인업 / 쿼터 ─────────────────────────────────────────────────────────────

export class LineupAssignmentResponseDto {
  @ApiProperty({ example: 'clx1234userId' })
  userId!: string;

  @ApiProperty({ enum: FormationSlot, example: FormationSlot.ST, description: '포메이션 슬롯 (예: LCM, RWB, ST, GK)' })
  position!: FormationSlot;
}

export class QuarterResponseDto {
  @ApiProperty({ example: 'clx1234quarterId' })
  id!: string;

  @ApiProperty({ example: 1, description: '쿼터 번호 (1~6)' })
  quarterNumber!: number;

  @ApiProperty({ example: '4-3-3' })
  formation!: string;

  @ApiPropertyOptional({ example: 'A', nullable: true })
  team!: string | null;

  @ApiProperty({ type: [LineupAssignmentResponseDto] })
  assignments!: LineupAssignmentResponseDto[];
}

// ─── 참여 선수 ─────────────────────────────────────────────────────────────────

export class ParticipantResponseDto {
  @ApiProperty({ example: 'clx1234participantId' })
  id!: string;

  @ApiProperty({ example: 'clx1234matchId' })
  matchId!: string;

  @ApiProperty({ example: 'clx1234userId' })
  userId!: string;
}

// ─── 경기 기록 ─────────────────────────────────────────────────────────────────

export class RecordResponseDto {
  @ApiProperty({ example: 'clx1234matchId' })
  id!: string;

  @ApiPropertyOptional({ example: 2, nullable: true })
  homeScore!: number | null;

  @ApiPropertyOptional({ example: 1, nullable: true })
  awayScore!: number | null;

  @ApiProperty({ example: true })
  isRecordSubmitted!: boolean;

  @ApiPropertyOptional({ example: '2026-04-15T14:00:00.000Z', nullable: true })
  recordedAt!: Date | null;
}

export class RecordHistoryItemResponseDto {
  @ApiProperty({ example: 'clx1234historyId' })
  id!: string;

  @ApiProperty({ example: 'clx1234userId', description: '수정자 userId' })
  editedBy!: string;

  @ApiProperty({ example: '2026-04-15T14:30:00.000Z' })
  editedAt!: Date;

  @ApiProperty({
    description: '수정 전 데이터 (homeScore, awayScore, goals)',
    example: { homeScore: 1, awayScore: 0, goals: [] },
  })
  beforeData!: Record<string, unknown>;

  @ApiProperty({
    description: '수정 후 데이터 (homeScore, awayScore, goals)',
    example: { homeScore: 2, awayScore: 1, goals: [] },
  })
  afterData!: Record<string, unknown>;
}

// ─── MOM 투표 ─────────────────────────────────────────────────────────────────

export class MomVoteResponseDto {
  @ApiProperty({ example: 'clx1234voteId' })
  id!: string;

  @ApiProperty({ example: 'clx1234matchId' })
  matchId!: string;

  @ApiProperty({ example: 'clx1234targetUserId' })
  targetUserId!: string;

  @ApiProperty({ example: '2026-04-15T15:00:00.000Z' })
  createdAt!: Date;
}

export class MomWinnerDto {
  @ApiProperty({ example: 'clx1234userId' })
  userId!: string;

  @ApiProperty({ example: '홍길동' })
  name!: string;

  @ApiProperty({ example: 7, description: '득표 수' })
  votes!: number;
}

export class MomResultResponseDto {
  @ApiProperty({ type: [MomWinnerDto], description: '득표수 내림차순 정렬 (공동 수상 포함)' })
  winners!: MomWinnerDto[];

  @ApiProperty({ example: 10, description: '총 투표자 수' })
  totalVoters!: number;
}

// ─── 댓글 ─────────────────────────────────────────────────────────────────────

export class CommentAuthorDto {
  @ApiProperty({ example: '홍길동' })
  name!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png', nullable: true })
  avatarUrl!: string | null;
}

export class CommentItemResponseDto {
  @ApiProperty({ example: 'clx1234commentId' })
  id!: string;

  @ApiProperty({ example: 'clx1234userId' })
  authorId!: string;

  @ApiProperty({ example: '오늘 경기 수고하셨습니다!' })
  content!: string;

  @ApiProperty({ example: '2026-04-15T16:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ type: CommentAuthorDto })
  author!: CommentAuthorDto;
}

export class CommentPageResponseDto {
  @ApiProperty({ type: [CommentItemResponseDto] })
  items!: CommentItemResponseDto[];

  @ApiPropertyOptional({ example: 'clx1234cursor', nullable: true })
  nextCursor!: string | null;
}

// ─── 영상 ─────────────────────────────────────────────────────────────────────

export class VideoResponseDto {
  @ApiProperty({ example: 'clx1234videoId' })
  id!: string;

  @ApiProperty({ example: 'https://www.youtube.com/watch?v=xxx' })
  youtubeUrl!: string;

  @ApiProperty({ example: 'clx1234userId', description: '등록자 userId' })
  registeredBy!: string;

  @ApiProperty({ example: '2026-04-15T17:00:00.000Z' })
  createdAt!: Date;
}

// ─── 상대팀 평가 ───────────────────────────────────────────────────────────────

export class OpponentRatingResponseDto {
  @ApiProperty({ example: 'clx1234ratingId' })
  id!: string;

  @ApiProperty({ example: 'clx1234matchId' })
  matchId!: string;

  @ApiProperty({ example: 4, description: '1~5점' })
  score!: number;

  @ApiPropertyOptional({ example: '매너가 좋은 팀이었습니다.', nullable: true })
  review!: string | null;

  @ApiPropertyOptional({ example: '김철수', nullable: true })
  mvpName!: string | null;

  @ApiProperty({ example: '2026-04-15T18:00:00.000Z' })
  createdAt!: Date;
}
