import { z } from 'zod';

// ─── Request ─────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
});

export const signupSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
  nickname: z
    .string()
    .min(2, '닉네임은 최소 2자 이상이어야 합니다.')
    .max(20, '닉네임은 최대 20자입니다.'),
});

// ─── Response ────────────────────────────────────────────────────────────────

export const accessTokenResponseSchema = z.object({
  accessToken: z.string(),
});

export const signupResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  nickname: z.string(),
  createdAt: z.string(),
});

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  nickname: z.string(),
  position: z.enum(['FW', 'MF', 'DF', 'GK']).nullable(),
  skillLevel: z.number(),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type AccessTokenResponse = z.infer<typeof accessTokenResponseSchema>;
export type SignupResponse = z.infer<typeof signupResponseSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
