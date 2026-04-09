import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const ClubLevelSchema = z.enum(['BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO']);
export const RecruitmentStatusSchema = z.enum(['OPEN', 'CLOSED']);
export const ClubRoleSchema = z.enum(['CAPTAIN', 'VICE_CAPTAIN', 'MEMBER']);
export const JoinRequestStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export const DissolveVoteStatusSchema = z.enum(['IN_PROGRESS', 'APPROVED', 'REJECTED', 'EXPIRED']);
export const LeaveReasonSchema = z.enum([
  'TIME_CONFLICT',
  'MOVING_TEAM',
  'QUIT_SOCCER',
  'BAD_ATMOSPHERE',
  'OTHER',
]);

// ─── Response Schemas ─────────────────────────────────────────────────────────

export const ClubPreviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: ClubLevelSchema,
  mannerScoreAvg: z.number(),
  regionName: z.string(),
  currentMemberCount: z.number().int(),
  maxMemberCount: z.number().int(),
  recruitmentStatus: RecruitmentStatusSchema,
  logoUrl: z.string().nullable(),
});

export const ClubDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: ClubLevelSchema,
  maxMemberCount: z.number().int(),
  currentMemberCount: z.number().int(),
  mannerScoreAvg: z.number(),
  recruitmentStatus: RecruitmentStatusSchema,
  logoUrl: z.string().nullable(),
  description: z.string().nullable(),
  regionId: z.string(),
  regionName: z.string(),
  myRole: ClubRoleSchema.nullable(),
  createdAt: z.string(),
});

export const ClubMemberSchema = z.object({
  userId: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  jerseyNumber: z.number().int().nullable(),
  role: ClubRoleSchema,
  position: z.enum(['FW', 'MF', 'DF', 'GK']).nullable(),
  mannerScore: z.number(),
  stats: z.object({
    goals: z.number().int(),
    assists: z.number().int(),
    momCount: z.number().int(),
    matchCount: z.number().int(),
  }),
  joinedAt: z.string(),
});

export const MemberStatsSchema = z.object({
  speed: z.number().int().min(0).max(99).nullable(),
  shoot: z.number().int().min(0).max(99).nullable(),
  pass: z.number().int().min(0).max(99).nullable(),
  dribble: z.number().int().min(0).max(99).nullable(),
  defense: z.number().int().min(0).max(99).nullable(),
  physical: z.number().int().min(0).max(99).nullable(),
  isStatsPublic: z.boolean(),
});

export const MemberDetailSchema = ClubMemberSchema.extend({
  foot: z.enum(['LEFT', 'RIGHT', 'BOTH']).nullable(),
  level: z.enum(['BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO']).nullable(),
  phone: z.string().nullable(),
  isPhonePublic: z.boolean(),
  stats: MemberStatsSchema.extend({
    goals: z.number().int(),
    assists: z.number().int(),
    momCount: z.number().int(),
    matchCount: z.number().int(),
  }),
});

export const JoinRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  userAvatarUrl: z.string().nullable(),
  userPosition: z.enum(['FW', 'MF', 'DF', 'GK']).nullable(),
  userLevel: z.enum(['BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO']).nullable(),
  userMannerScore: z.number(),
  message: z.string().nullable(),
  status: JoinRequestStatusSchema,
  createdAt: z.string(),
});

export const InviteCodeSchema = z.object({
  code: z.string(),
  expiresAt: z.string(),
  isExpired: z.boolean(),
});

export const DissolveVoteSchema = z.object({
  id: z.string(),
  status: DissolveVoteStatusSchema,
  expiresAt: z.string(),
  totalCount: z.number().int(),
  agreedCount: z.number().int(),
  myResponse: z.boolean().nullable(),
});

// ─── Cursor Page ──────────────────────────────────────────────────────────────

export function cursorPageSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    nextCursor: z.string().nullable(),
  });
}

export const ClubMemberPageSchema = cursorPageSchema(ClubMemberSchema);
export const JoinRequestPageSchema = cursorPageSchema(JoinRequestSchema);
export const ClubPreviewPageSchema = cursorPageSchema(ClubPreviewSchema);

// ─── Form Input Schemas ───────────────────────────────────────────────────────

export const CreateClubInputSchema = z.object({
  name: z.string().min(2, '팀 이름은 최소 2자 이상이어야 합니다.').max(30, '팀 이름은 최대 30자입니다.'),
  regionId: z.string().min(1, '지역을 선택해주세요.'),
  level: ClubLevelSchema,
  maxMemberCount: z
    .number()
    .int()
    .min(2, '최소 2명 이상이어야 합니다.')
    .max(50, '최대 50명까지 설정 가능합니다.'),
  description: z.string().max(500).optional(),
  logoUrl: z.string().optional(),
});

export const JoinRequestInputSchema = z.object({
  message: z.string().max(500, '신청 메시지는 최대 500자입니다.').optional(),
});

export const JoinByCodeInputSchema = z.object({
  code: z.string().min(1, '초대 코드를 입력해주세요.'),
});

export const UpdateMemberStatsInputSchema = MemberStatsSchema;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClubLevel = z.infer<typeof ClubLevelSchema>;
export type RecruitmentStatus = z.infer<typeof RecruitmentStatusSchema>;
export type ClubRole = z.infer<typeof ClubRoleSchema>;
export type ClubPreview = z.infer<typeof ClubPreviewSchema>;
export type ClubDetail = z.infer<typeof ClubDetailSchema>;
export type ClubMember = z.infer<typeof ClubMemberSchema>;
export type MemberDetail = z.infer<typeof MemberDetailSchema>;
export type JoinRequest = z.infer<typeof JoinRequestSchema>;
export type InviteCode = z.infer<typeof InviteCodeSchema>;
export type DissolveVote = z.infer<typeof DissolveVoteSchema>;
export type ClubMemberPage = z.infer<typeof ClubMemberPageSchema>;
export type JoinRequestPage = z.infer<typeof JoinRequestPageSchema>;
export type ClubPreviewPage = z.infer<typeof ClubPreviewPageSchema>;
export type CreateClubInput = z.infer<typeof CreateClubInputSchema>;
export type JoinRequestInput = z.infer<typeof JoinRequestInputSchema>;
export type JoinByCodeInput = z.infer<typeof JoinByCodeInputSchema>;
export type UpdateMemberStatsInput = z.infer<typeof UpdateMemberStatsInputSchema>;
export type LeaveReason = z.infer<typeof LeaveReasonSchema>;
