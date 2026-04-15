import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const MatchPostStatusSchema = z.enum(['OPEN', 'MATCHED', 'CANCELLED']);
export const MatchApplicationStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED']);
export const MatchGenderSchema = z.enum(['MALE', 'FEMALE', 'MIXED']);
export const ClubLevelSchema = z.enum(['BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO']);

export type MatchPostStatus = z.infer<typeof MatchPostStatusSchema>;
export type MatchApplicationStatus = z.infer<typeof MatchApplicationStatusSchema>;
export type MatchGender = z.infer<typeof MatchGenderSchema>;

// ─── Response Schemas ─────────────────────────────────────────────────────────

export const MatchPostSummarySchema = z.object({
  id: z.string(),
  clubId: z.string(),
  clubName: z.string(),
  clubLogoUrl: z.string().nullable(),
  clubLevel: ClubLevelSchema,
  matchDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string(),
  address: z.string().nullable(),
  playerCount: z.number().int(),
  gender: MatchGenderSchema,
  level: ClubLevelSchema,
  fee: z.number().int(),
  status: MatchPostStatusSchema,
  isExpired: z.boolean(),
  createdAt: z.string(),
  regionName: z.string(),
  regionSigungu: z.string(),
  opponentClubName: z.string().nullable().optional(),
  opponentClubLevel: ClubLevelSchema.nullable().optional(),
});

export const MatchPostDetailSchema = MatchPostSummarySchema.extend({
  isOwnPost: z.boolean(),
  canApply: z.boolean(),
  contactName: z.string().nullable(),
  contactPhone: z.string().nullable(),
});

export const MatchPostListSchema = z.object({
  items: z.array(MatchPostSummarySchema),
  nextCursor: z.string().nullable(),
});

export const MyMatchPostListSchema = z.object({
  items: z.array(MatchPostSummarySchema),
});

export const MatchContactSchema = z.object({
  contactName: z.string(),
  contactPhone: z.string(),
});

// ─── Form Schemas ─────────────────────────────────────────────────────────────

export const CreateMatchPostSchema = z.object({
  matchDate: z.string().min(1, '경기 날짜를 선택해주세요.'),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'HH:mm 형식으로 입력해주세요.'),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'HH:mm 형식으로 입력해주세요.'),
  location: z.string().min(1, '구장 이름을 입력해주세요.').max(100),
  address: z.string().max(200).optional(),
  playerCount: z.number().int().min(5, '최소 5명').max(11, '최대 11명'),
  gender: MatchGenderSchema,
  level: ClubLevelSchema,
  fee: z.number().int().min(0, '0 이상이어야 합니다.'),
  contactName: z.string().min(1, '담당자 이름을 입력해주세요.').max(50),
  contactPhone: z.string().min(1, '연락처를 입력해주세요.').max(20),
  regionId: z.string().min(1, '지역을 선택해주세요.'),
});

export const UpdateMatchPostSchema = CreateMatchPostSchema.partial();

// ─── Types ────────────────────────────────────────────────────────────────────

export type MatchPostSummary = z.infer<typeof MatchPostSummarySchema>;
export type MatchPostDetail = z.infer<typeof MatchPostDetailSchema>;
export type MatchPostList = z.infer<typeof MatchPostListSchema>;
export type MyMatchPostList = z.infer<typeof MyMatchPostListSchema>;
export type MatchContact = z.infer<typeof MatchContactSchema>;
export type CreateMatchPostInput = z.infer<typeof CreateMatchPostSchema>;
export type UpdateMatchPostInput = z.infer<typeof UpdateMatchPostSchema>;

// ─── Filter ───────────────────────────────────────────────────────────────────

export interface MatchPostFilters {
  cursor?: string;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  regionId?: string;
  level?: string;
  gender?: string;
  hasFee?: boolean;
  includeExpired?: boolean;
  includeMatched?: boolean;
}
