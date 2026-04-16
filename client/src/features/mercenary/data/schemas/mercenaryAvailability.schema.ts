import { z } from 'zod';
import { PlayerPositionSchema, PlayerLevelSchema } from './mercenaryPost.schema';

// ─── Response Schemas ─────────────────────────────────────────────────────────

export const MercenaryAvailabilitySummarySchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  userAvatarUrl: z.string().nullable(),
  userLevel: PlayerLevelSchema.nullable(),
  positions: z.array(PlayerPositionSchema),
  availableDates: z.array(z.string()),
  regionNames: z.array(z.string()),
  timeSlot: z.string().nullable(),
  acceptsFee: z.boolean(),
  isExpired: z.boolean(),
  mannerScore: z.number(),
  mercenaryMatchCount: z.number().int(),
  createdAt: z.string(),
});

export const MercenaryAvailabilityDetailSchema = MercenaryAvailabilitySummarySchema.extend({
  age: z.number().int().nullable(),
  bio: z.string().nullable(),
  isOwnPost: z.boolean(),
  canRecruit: z.boolean(),
  alreadyRecruited: z.boolean(),
});

export const MercenaryAvailabilityListSchema = z.object({
  items: z.array(MercenaryAvailabilitySummarySchema),
  nextCursor: z.string().nullable(),
});

export const MercenaryMyAvailabilityListSchema = z.object({
  items: z.array(
    MercenaryAvailabilitySummarySchema.extend({ bio: z.string().nullable() }),
  ),
});

export const MercenaryApplicationStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED']);

export const MercenaryRecruitmentItemSchema = z.object({
  id: z.string(),
  availabilityId: z.string(),
  recruitingClubId: z.string(),
  recruitingClubName: z.string(),
  recruitingClubLevel: z.enum(['BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO']),
  recruitingClubLogoUrl: z.string().nullable(),
  message: z.string().nullable(),
  contactName: z.string(),
  contactPhone: z.string(),
  status: MercenaryApplicationStatusSchema,
  createdAt: z.string(),
});

export const MercenaryRecruitmentListSchema = z.object({
  items: z.array(MercenaryRecruitmentItemSchema),
});

export const MercenaryRecruitContactSchema = z.object({
  contact: z.object({
    player: z.object({ name: z.string(), phone: z.string() }),
    club: z.object({ name: z.string(), phone: z.string() }),
  }),
});

// ─── Form Schemas ─────────────────────────────────────────────────────────────

export const CreateMercenaryAvailabilitySchema = z.object({
  positions: z.array(PlayerPositionSchema).min(1, '포지션을 선택해주세요.'),
  availableDates: z.array(z.string()).min(1, '가능 날짜를 선택해주세요.'),
  regionIds: z.array(z.string()).min(1, '지역을 선택해주세요.'),
  timeSlot: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  acceptsFee: z.boolean(),
});

export const UpdateMercenaryAvailabilitySchema = CreateMercenaryAvailabilitySchema.partial();

export const CreateMercenaryRecruitmentSchema = z.object({
  message: z.string().max(100).optional(),
  contactName: z.string().min(1).max(50),
  contactPhone: z.string().min(1).max(20),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type MercenaryAvailabilitySummary = z.infer<typeof MercenaryAvailabilitySummarySchema>;
export type MercenaryAvailabilityDetail = z.infer<typeof MercenaryAvailabilityDetailSchema>;
export type MercenaryAvailabilityList = z.infer<typeof MercenaryAvailabilityListSchema>;
export type MercenaryMyAvailabilityList = z.infer<typeof MercenaryMyAvailabilityListSchema>;
export type MercenaryRecruitmentItem = z.infer<typeof MercenaryRecruitmentItemSchema>;
export type MercenaryRecruitmentList = z.infer<typeof MercenaryRecruitmentListSchema>;
export type MercenaryRecruitContact = z.infer<typeof MercenaryRecruitContactSchema>;
export type CreateMercenaryAvailabilityInput = z.infer<typeof CreateMercenaryAvailabilitySchema>;
export type UpdateMercenaryAvailabilityInput = z.infer<typeof UpdateMercenaryAvailabilitySchema>;
export type CreateMercenaryRecruitmentInput = z.infer<typeof CreateMercenaryRecruitmentSchema>;

// ─── Filter Types ─────────────────────────────────────────────────────────────

export type MercenaryAvailabilityFilters = {
  cursor?: string;
  limit?: number;
  date?: string;
  positions?: z.infer<typeof PlayerPositionSchema>[];
  regionId?: string;
  level?: z.infer<typeof PlayerLevelSchema>;
  includeExpired?: boolean;
};
