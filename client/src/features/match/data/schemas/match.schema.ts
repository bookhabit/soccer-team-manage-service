import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const MatchTypeSchema = z.enum(['LEAGUE', 'SELF']);
export const AttendanceResponseSchema = z.enum(['ATTEND', 'ABSENT', 'UNDECIDED']);
export const ClubLevelSchema = z.enum(['BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO']);
export const PlayerPositionSchema = z.enum(['FW', 'MF', 'DF', 'GK']);

/** 경기 상태 — 클라이언트 computed (API 응답에 없음) */
export const MatchStatusSchema = z.enum(['BEFORE', 'DURING', 'AFTER']);

export type MatchType = z.infer<typeof MatchTypeSchema>;
export type AttendanceResponse = z.infer<typeof AttendanceResponseSchema>;
export type MatchStatus = z.infer<typeof MatchStatusSchema>;

// ─── Response Schemas ─────────────────────────────────────────────────────────

export const MatchSummarySchema = z.object({
  id: z.string(),
  type: MatchTypeSchema,
  title: z.string(),
  location: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  voteDeadline: z.string(),
  opponentName: z.string().nullable(),
  opponentLevel: ClubLevelSchema.nullable(),
  homeScore: z.number().int().nullable(),
  awayScore: z.number().int().nullable(),
  isRecordSubmitted: z.boolean(),
  myResponse: AttendanceResponseSchema.nullable(),
  attendCount: z.number().int(),
  absentCount: z.number().int(),
});

export const MatchDetailSchema = MatchSummarySchema.extend({
  undecidedCount: z.number().int(),
  recordedAt: z.string().nullable(),
});

export const MatchPageSchema = z.object({
  items: z.array(MatchSummarySchema),
  nextCursor: z.string().nullable(),
});

export const AttendanceSchema = z.object({
  userId: z.string(),
  response: AttendanceResponseSchema,
  user: z.object({
    name: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
});

export const AssignmentSchema = z.object({
  userId: z.string(),
  position: PlayerPositionSchema,
});

export const QuarterSchema = z.object({
  id: z.string(),
  quarterNumber: z.number().int(),
  formation: z.string(),
  team: z.string().nullable(),
  assignments: z.array(AssignmentSchema),
});

export const LineupSchema = z.array(QuarterSchema);

export const GoalSchema = z.object({
  id: z.string(),
  scorerUserId: z.string(),
  assistUserId: z.string().nullable(),
  quarterNumber: z.number().int().nullable(),
  team: z.string().nullable(),
  createdAt: z.string(),
});

export const MomResultSchema = z.object({
  winners: z.array(
    z.object({
      userId: z.string(),
      name: z.string(),
      votes: z.number().int(),
    }),
  ),
  totalVoters: z.number().int(),
});

export const MatchCommentSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  content: z.string(),
  createdAt: z.string(),
  author: z.object({
    name: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
});

export const MatchCommentPageSchema = z.object({
  items: z.array(MatchCommentSchema),
  nextCursor: z.string().nullable(),
});

export const MatchVideoSchema = z.object({
  id: z.string(),
  youtubeUrl: z.string(),
  registeredBy: z.string(),
  createdAt: z.string(),
});

export const OpponentRatingSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  score: z.number(),
  review: z.string().nullable(),
  mvpName: z.string().nullable(),
  createdAt: z.string(),
});

export const RecordHistorySchema = z.object({
  id: z.string(),
  editedBy: z.string(),
  editedAt: z.string(),
  beforeData: z.unknown(),
  afterData: z.unknown(),
});

// ─── Form Schemas ─────────────────────────────────────────────────────────────

export const CreateMatchSchema = z.object({
  type: MatchTypeSchema,
  title: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
  address: z.string().max(200).optional(),
  startAt: z.string().min(1, '시작 시간을 선택해주세요.'),
  endAt: z.string().min(1, '종료 시간을 선택해주세요.'),
  voteDeadline: z.string().min(1, '투표 마감 시간을 선택해주세요.'),
  opponentName: z.string().max(50).optional(),
  opponentLevel: ClubLevelSchema.optional(),
});

export const UpdateMatchSchema = CreateMatchSchema.partial();

export const GoalInputSchema = z.object({
  scorerUserId: z.string().min(1),
  assistUserId: z.string().optional(),
  quarterNumber: z.number().int().min(1).max(6).optional(),
  team: z.string().optional(),
});

export const RecordInputSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  goals: z.array(GoalInputSchema),
});

export const AssignmentInputSchema = z.object({
  userId: z.string().min(1),
  position: PlayerPositionSchema,
});

export const QuarterInputSchema = z.object({
  quarterNumber: z.number().int().min(1).max(6),
  formation: z.string().min(1),
  team: z.string().optional(),
  assignments: z.array(AssignmentInputSchema),
});

export const SaveLineupSchema = z.object({
  quarters: z.array(QuarterInputSchema),
});

export const SubmitMomVoteSchema = z.object({
  targetUserId: z.string().min(1),
});

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(500, '댓글은 최대 500자입니다.'),
});

export const RegisterVideoSchema = z.object({
  youtubeUrl: z.string().url('유효한 YouTube URL을 입력해주세요.'),
});

export const SubmitOpponentRatingSchema = z.object({
  score: z.number().min(1).max(5),
  review: z.string().max(500).optional(),
  mvpName: z.string().max(50).optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type MatchSummary = z.infer<typeof MatchSummarySchema>;
export type MatchDetail = z.infer<typeof MatchDetailSchema>;
export type MatchPage = z.infer<typeof MatchPageSchema>;
export type Attendance = z.infer<typeof AttendanceSchema>;
export type Quarter = z.infer<typeof QuarterSchema>;
export type Lineup = z.infer<typeof LineupSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type MomResult = z.infer<typeof MomResultSchema>;
export type MatchComment = z.infer<typeof MatchCommentSchema>;
export type MatchCommentPage = z.infer<typeof MatchCommentPageSchema>;
export type MatchVideo = z.infer<typeof MatchVideoSchema>;
export type OpponentRating = z.infer<typeof OpponentRatingSchema>;
export type RecordHistory = z.infer<typeof RecordHistorySchema>;

export type CreateMatchInput = z.infer<typeof CreateMatchSchema>;
export type UpdateMatchInput = z.infer<typeof UpdateMatchSchema>;
export type RecordInput = z.infer<typeof RecordInputSchema>;
export type SaveLineupInput = z.infer<typeof SaveLineupSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type SubmitOpponentRatingInput = z.infer<typeof SubmitOpponentRatingSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** 경기 상태를 시간 기반으로 계산 */
export function computeMatchStatus(startAt: string, endAt: string): MatchStatus {
  const now = Date.now();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  if (now < start) return 'BEFORE';
  if (now > end) return 'AFTER';
  return 'DURING';
}
