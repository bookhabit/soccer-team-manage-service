import { z } from 'zod';

// ─── Request ─────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
});

export const signupSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
  name: z
    .string()
    .min(2, '닉네임은 최소 2자 이상이어야 합니다.')
    .max(20, '닉네임은 최대 20자입니다.'),
});

export const onboardingSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.').max(20, '이름은 최대 20자입니다.'),
  birthYear: z
    .number()
    .int()
    .min(1950, '출생 연도는 1950 이상이어야 합니다.')
    .max(2010, '출생 연도는 2010 이하여야 합니다.'),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  position: z.enum(['FW', 'MF', 'DF', 'GK']),
  foot: z.enum(['LEFT', 'RIGHT', 'BOTH']),
  years: z
    .number()
    .int()
    .min(0, '경력은 0 이상이어야 합니다.')
    .max(50, '경력은 50 이하여야 합니다.'),
  level: z.enum(['BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO']),
  preferredRegionId: z.string().optional(),
});

// ─── Response ────────────────────────────────────────────────────────────────

export const accessTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const signupResponseSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  createdAt: z.string(),
});

export const userProfileSchema = z.object({
  id: z.string(),
  provider: z.enum(['LOCAL', 'KAKAO', 'GOOGLE', 'APPLE']),
  email: z.string().nullable(),
  name: z.string().nullable(),
  birthYear: z.number().int().nullable(),
  gender: z.enum(['MALE', 'FEMALE']).nullable(),
  position: z.enum(['FW', 'MF', 'DF', 'GK']).nullable(),
  foot: z.enum(['LEFT', 'RIGHT', 'BOTH']).nullable(),
  years: z.number().int().nullable(),
  level: z.enum(['BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO']).nullable(),
  preferredRegionId: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  mannerScore: z.number(),
  isOnboarded: z.boolean(),
  status: z.enum(['ACTIVE', 'RESTRICTED', 'DELETED']),
  createdAt: z.string(),
});

export const regionSchema = z.object({
  id: z.string(),
  name: z.string(),
  sigungu: z.string(),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type AccessTokenResponse = z.infer<typeof accessTokenResponseSchema>;
export type SignupResponse = z.infer<typeof signupResponseSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type Region = z.infer<typeof regionSchema>;
