import { z } from 'zod';
import { MatchApplicationStatusSchema, MatchPostSummarySchema } from './matchPost.schema';

// ─── Response Schemas ─────────────────────────────────────────────────────────

export const ClubLevelSchema = z.enum(['BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO']);

export const MatchApplicationItemSchema = z.object({
  id: z.string(),
  postId: z.string(),
  applicantClubId: z.string(),
  applicantClubName: z.string(),
  applicantClubLogoUrl: z.string().nullable(),
  applicantClubLevel: ClubLevelSchema,
  message: z.string().nullable(),
  contactName: z.string(),
  contactPhone: z.string(),
  status: MatchApplicationStatusSchema,
  createdAt: z.string(),
});

export const MatchApplicationListSchema = z.object({
  items: z.array(MatchApplicationItemSchema),
});

export const MyApplicationItemSchema = z.object({
  id: z.string(),
  message: z.string().nullable(),
  status: MatchApplicationStatusSchema,
  createdAt: z.string(),
  post: MatchPostSummarySchema,
});

export const MyApplicationListSchema = z.object({
  items: z.array(MyApplicationItemSchema),
});

// ─── Form Schemas ─────────────────────────────────────────────────────────────

export const CreateMatchApplicationSchema = z.object({
  message: z.string().max(100, '메시지는 최대 100자입니다.').optional(),
  contactName: z.string().min(1, '담당자 이름을 입력해주세요.').max(50),
  contactPhone: z.string().min(1, '연락처를 입력해주세요.').max(20),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type MatchApplicationItem = z.infer<typeof MatchApplicationItemSchema>;
export type MatchApplicationList = z.infer<typeof MatchApplicationListSchema>;
export type MyApplicationItem = z.infer<typeof MyApplicationItemSchema>;
export type MyApplicationList = z.infer<typeof MyApplicationListSchema>;
export type CreateMatchApplicationInput = z.infer<typeof CreateMatchApplicationSchema>;
