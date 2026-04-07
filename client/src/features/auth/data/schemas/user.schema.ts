import { z } from 'zod';

// ─── Request ─────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.').max(20, '이름은 최대 20자입니다.').optional(),
  position: z.enum(['FW', 'MF', 'DF', 'GK']).optional(),
  foot: z.enum(['LEFT', 'RIGHT', 'BOTH']).optional(),
  level: z.enum(['BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO']).optional(),
  preferredRegionId: z.string().optional(),
});

export const withdrawSchema = z.object({
  reason: z.enum(['TIME_CONFLICT', 'MOVING_TEAM', 'QUITTING_SOCCER', 'BAD_ATMOSPHERE', 'OTHER']),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
