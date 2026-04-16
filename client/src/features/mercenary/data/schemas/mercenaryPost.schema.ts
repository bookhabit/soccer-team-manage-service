import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const MercenaryPostStatusSchema = z.enum(['OPEN', 'CLOSED']);
export const MercenaryApplicationStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED']);
export const PlayerPositionSchema = z.enum(['FW', 'MF', 'DF', 'GK']);
export const ClubLevelSchema = z.enum(['BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO']);

export type MercenaryPostStatus = z.infer<typeof MercenaryPostStatusSchema>;
export type MercenaryApplicationStatus = z.infer<typeof MercenaryApplicationStatusSchema>;
export type PlayerPosition = z.infer<typeof PlayerPositionSchema>;

// ─── Response Schemas ─────────────────────────────────────────────────────────

export const MercenaryPostSummarySchema = z.object({
  id: z.string(),
  clubId: z.string(),
  clubName: z.string(),
  clubLogoUrl: z.string().nullable(),
  clubLevel: ClubLevelSchema,
  positions: z.array(PlayerPositionSchema),
  requiredCount: z.number().int(),
  acceptedCount: z.number().int(),
  matchDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string(),
  address: z.string().nullable(),
  level: ClubLevelSchema,
  fee: z.number().int(),
  status: MercenaryPostStatusSchema,
  isExpired: z.boolean(),
  createdAt: z.string(),
  regionName: z.string(),
  regionSigungu: z.string(),
});

export const MercenaryPostDetailSchema = MercenaryPostSummarySchema.extend({
  description: z.string().nullable(),
  contactName: z.string(),
  contactPhone: z.string(),
  isOwnPost: z.boolean(),
  canApply: z.boolean(),
  alreadyApplied: z.boolean(),
  myApplicationStatus: MercenaryApplicationStatusSchema.nullable(),
});

export const MercenaryPostListSchema = z.object({
  items: z.array(MercenaryPostSummarySchema),
  nextCursor: z.string().nullable(),
});

export const MercenaryMyPostListSchema = z.object({
  items: z.array(MercenaryPostSummarySchema),
});

// ─── Application Schemas ─────────────────────────────────────────────────────

export const PlayerLevelSchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);

export const MercenaryApplicationItemSchema = z.object({
  id: z.string(),
  postId: z.string(),
  applicantId: z.string(),
  applicantName: z.string(),
  applicantLevel: PlayerLevelSchema.nullable(),
  applicantPosition: PlayerPositionSchema.nullable(),
  applicantAvatarUrl: z.string().nullable(),
  applicantMannerScore: z.number(),
  mercenaryMatchCount: z.number().int(),
  message: z.string().nullable(),
  status: MercenaryApplicationStatusSchema,
  createdAt: z.string(),
});

export const MercenaryApplicationListSchema = z.object({
  items: z.array(MercenaryApplicationItemSchema),
});

export const MercenaryContactSchema = z.object({
  contact: z.object({
    applicant: z.object({ name: z.string(), phone: z.string() }),
    postCreator: z.object({ name: z.string(), phone: z.string() }),
  }),
});

// ─── Form Schemas ─────────────────────────────────────────────────────────────

export const CreateMercenaryPostSchema = z.object({
  positions: z.array(PlayerPositionSchema).min(1, '포지션을 선택해주세요.'),
  requiredCount: z.number().int().min(1).max(20),
  matchDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().min(1).max(100),
  address: z.string().max(200).optional(),
  regionId: z.string(),
  level: ClubLevelSchema,
  fee: z.number().int().min(0),
  description: z.string().max(500).optional(),
  contactName: z.string().min(1).max(50),
  contactPhone: z.string().min(1).max(20),
});

export const UpdateMercenaryPostSchema = CreateMercenaryPostSchema.partial();

export const CreateMercenaryApplicationSchema = z.object({
  message: z.string().max(100).optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type MercenaryPostSummary = z.infer<typeof MercenaryPostSummarySchema>;
export type MercenaryPostDetail = z.infer<typeof MercenaryPostDetailSchema>;
export type MercenaryPostList = z.infer<typeof MercenaryPostListSchema>;
export type MercenaryMyPostList = z.infer<typeof MercenaryMyPostListSchema>;
export type MercenaryApplicationItem = z.infer<typeof MercenaryApplicationItemSchema>;
export type MercenaryApplicationList = z.infer<typeof MercenaryApplicationListSchema>;
export type MercenaryContact = z.infer<typeof MercenaryContactSchema>;
export type CreateMercenaryPostInput = z.infer<typeof CreateMercenaryPostSchema>;
export type UpdateMercenaryPostInput = z.infer<typeof UpdateMercenaryPostSchema>;
export type CreateMercenaryApplicationInput = z.infer<typeof CreateMercenaryApplicationSchema>;

// ─── Filter Types ─────────────────────────────────────────────────────────────

export type MercenaryPostFilters = {
  cursor?: string;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  positions?: PlayerPosition[];
  regionId?: string;
  level?: z.infer<typeof ClubLevelSchema>;
  includeExpired?: boolean;
  includeClosed?: boolean;
};
