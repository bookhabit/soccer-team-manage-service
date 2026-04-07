/**
 * Unit Tests — Auth & User Schemas
 *
 * 대상: auth.schema.ts, user.schema.ts
 * 도구: Vitest
 * 커버리지 목표: 90% 이상
 */

import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  signupSchema,
  onboardingSchema,
  userProfileSchema,
  regionSchema,
} from '../auth.schema';
import { updateProfileSchema, withdrawSchema } from '../user.schema';

// ─── loginSchema ─────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  // AUTH-02-001
  it('AUTH-02-001: 유효한 이메일과 8자 이상 비밀번호를 입력하면 parse에 성공한다', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'password1' });
    expect(result.success).toBe(true);
  });

  // AUTH-02-002
  it('AUTH-02-002: 이메일 형식이 아닌 값을 입력하면 invalid_string 에러를 반환한다', () => {
    const result = loginSchema.safeParse({ email: 'notanemail', password: 'password1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('invalid_string');
    }
  });

  // AUTH-02-003
  it('AUTH-02-003: 비밀번호가 7자이면 too_small 에러를 반환한다', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'short1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.issues.find((i) => i.path.includes('password'));
      expect(passwordError?.code).toBe('too_small');
    }
  });
});

// ─── signupSchema ─────────────────────────────────────────────────────────────

describe('signupSchema', () => {
  // AUTH-02-004
  it('AUTH-02-004: 닉네임이 1자이면 too_small 에러를 반환한다', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'password1',
      name: '홍',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes('name'));
      expect(nameError?.code).toBe('too_small');
    }
  });

  // AUTH-02-005
  it('AUTH-02-005: 닉네임이 21자이면 too_big 에러를 반환한다', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'password1',
      name: 'a'.repeat(21),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes('name'));
      expect(nameError?.code).toBe('too_big');
    }
  });

  it('유효한 값 전체를 입력하면 parse에 성공한다', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'password1',
      name: '홍길동',
    });
    expect(result.success).toBe(true);
  });
});

// ─── onboardingSchema ─────────────────────────────────────────────────────────

describe('onboardingSchema', () => {
  const VALID_INPUT = {
    name: '홍길동',
    birthYear: 1995,
    position: 'FW' as const,
    foot: 'RIGHT' as const,
    years: 5,
    level: 'AMATEUR' as const,
  };

  // AUTH-02-006
  it('AUTH-02-006: 필수 필드 모두 유효하고 gender를 생략하면 parse에 성공한다', () => {
    const result = onboardingSchema.safeParse(VALID_INPUT);
    expect(result.success).toBe(true);
  });

  // AUTH-02-007
  it('AUTH-02-007: birthYear = 1949 (하한 미만)이면 too_small 에러를 반환한다', () => {
    const result = onboardingSchema.safeParse({ ...VALID_INPUT, birthYear: 1949 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes('birthYear'));
      expect(err?.code).toBe('too_small');
    }
  });

  // AUTH-02-008
  it('AUTH-02-008: birthYear = 2011 (상한 초과)이면 too_big 에러를 반환한다', () => {
    const result = onboardingSchema.safeParse({ ...VALID_INPUT, birthYear: 2011 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes('birthYear'));
      expect(err?.code).toBe('too_big');
    }
  });

  // AUTH-02-009
  it('AUTH-02-009: years = -1이면 too_small 에러를 반환한다', () => {
    const result = onboardingSchema.safeParse({ ...VALID_INPUT, years: -1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes('years'));
      expect(err?.code).toBe('too_small');
    }
  });

  // AUTH-02-010
  it('AUTH-02-010: years = 51이면 too_big 에러를 반환한다', () => {
    const result = onboardingSchema.safeParse({ ...VALID_INPUT, years: 51 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes('years'));
      expect(err?.code).toBe('too_big');
    }
  });

  // AUTH-02-011
  it('AUTH-02-011: position = "ST" (유효하지 않은 enum)이면 invalid_enum_value 에러를 반환한다', () => {
    const result = onboardingSchema.safeParse({ ...VALID_INPUT, position: 'ST' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes('position'));
      expect(err?.code).toBe('invalid_enum_value');
    }
  });

  // AUTH-02-012
  it('AUTH-02-012: foot = "BOTH"이면 parse에 성공한다', () => {
    const result = onboardingSchema.safeParse({ ...VALID_INPUT, foot: 'BOTH' });
    expect(result.success).toBe(true);
  });

  it('birthYear 경계값 — 1950 (하한)은 parse에 성공한다', () => {
    const result = onboardingSchema.safeParse({ ...VALID_INPUT, birthYear: 1950 });
    expect(result.success).toBe(true);
  });

  it('birthYear 경계값 — 2010 (상한)은 parse에 성공한다', () => {
    const result = onboardingSchema.safeParse({ ...VALID_INPUT, birthYear: 2010 });
    expect(result.success).toBe(true);
  });

  it('years 경계값 — 0은 parse에 성공한다', () => {
    const result = onboardingSchema.safeParse({ ...VALID_INPUT, years: 0 });
    expect(result.success).toBe(true);
  });

  it('years 경계값 — 50은 parse에 성공한다', () => {
    const result = onboardingSchema.safeParse({ ...VALID_INPUT, years: 50 });
    expect(result.success).toBe(true);
  });

  it('gender = "MALE"이면 parse에 성공한다', () => {
    const result = onboardingSchema.safeParse({ ...VALID_INPUT, gender: 'MALE' });
    expect(result.success).toBe(true);
  });

  it('gender = "FEMALE"이면 parse에 성공한다', () => {
    const result = onboardingSchema.safeParse({ ...VALID_INPUT, gender: 'FEMALE' });
    expect(result.success).toBe(true);
  });
});

// ─── updateProfileSchema ──────────────────────────────────────────────────────

describe('updateProfileSchema', () => {
  // AUTH-02-013
  it('AUTH-02-013: 모든 필드를 생략해도 parse에 성공하고 빈 객체를 반환한다', () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({});
    }
  });

  // AUTH-02-014
  it('AUTH-02-014: name = "홍" (1자)이면 too_small 에러를 반환한다', () => {
    const result = updateProfileSchema.safeParse({ name: '홍' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes('name'));
      expect(err?.code).toBe('too_small');
    }
  });

  it('name = "홍길동"이면 parse에 성공한다', () => {
    const result = updateProfileSchema.safeParse({ name: '홍길동' });
    expect(result.success).toBe(true);
  });

  it('position만 업데이트하면 parse에 성공한다', () => {
    const result = updateProfileSchema.safeParse({ position: 'GK' });
    expect(result.success).toBe(true);
  });
});

// ─── withdrawSchema ───────────────────────────────────────────────────────────

describe('withdrawSchema', () => {
  // AUTH-02-015
  it('AUTH-02-015: reason = "TIME_CONFLICT"이면 parse에 성공한다', () => {
    const result = withdrawSchema.safeParse({ reason: 'TIME_CONFLICT' });
    expect(result.success).toBe(true);
  });

  // AUTH-02-016
  it('AUTH-02-016: reason = "UNKNOWN_REASON"이면 invalid_enum_value 에러를 반환한다', () => {
    const result = withdrawSchema.safeParse({ reason: 'UNKNOWN_REASON' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('invalid_enum_value');
    }
  });

  it('모든 유효한 reason enum 값을 parse할 수 있다', () => {
    const validReasons = ['TIME_CONFLICT', 'MOVING_TEAM', 'QUITTING_SOCCER', 'BAD_ATMOSPHERE', 'OTHER'];
    for (const reason of validReasons) {
      const result = withdrawSchema.safeParse({ reason });
      expect(result.success).toBe(true);
    }
  });
});

// ─── userProfileSchema ────────────────────────────────────────────────────────

describe('userProfileSchema', () => {
  const VALID_PROFILE = {
    id: 'user-123',
    provider: 'LOCAL' as const,
    email: 'user@example.com',
    name: '홍길동',
    birthYear: 1990,
    gender: 'MALE' as const,
    position: 'FW' as const,
    foot: 'RIGHT' as const,
    years: 5,
    level: 'AMATEUR' as const,
    preferredRegionId: null,
    avatarUrl: null,
    mannerScore: 36.5,
    isOnboarded: true,
    status: 'ACTIVE' as const,
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  // AUTH-02-017
  it('AUTH-02-017: status = "DELETED"이면 parse에 성공한다', () => {
    const result = userProfileSchema.safeParse({ ...VALID_PROFILE, status: 'DELETED' });
    expect(result.success).toBe(true);
  });

  // AUTH-02-018
  it('AUTH-02-018: mannerScore = "100" (string)이면 expected number 에러를 반환한다', () => {
    const result = userProfileSchema.safeParse({ ...VALID_PROFILE, mannerScore: '100' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes('mannerScore'));
      expect(err?.code).toBe('invalid_type');
    }
  });

  it('nullable 필드들이 null이어도 parse에 성공한다', () => {
    const result = userProfileSchema.safeParse({
      ...VALID_PROFILE,
      name: null,
      birthYear: null,
      gender: null,
      position: null,
      foot: null,
      years: null,
      level: null,
      preferredRegionId: null,
      avatarUrl: null,
      email: null,
    });
    expect(result.success).toBe(true);
  });

  it('status = "RESTRICTED"이면 parse에 성공한다', () => {
    const result = userProfileSchema.safeParse({ ...VALID_PROFILE, status: 'RESTRICTED' });
    expect(result.success).toBe(true);
  });
});

// ─── regionSchema ─────────────────────────────────────────────────────────────

describe('regionSchema', () => {
  // USER-02-001
  it('USER-02-001: id, name, sigungu 모두 string이면 parse에 성공한다', () => {
    const result = regionSchema.safeParse({
      id: 'region-1',
      name: '서울특별시',
      sigungu: '강남구',
    });
    expect(result.success).toBe(true);
  });

  it('필드가 누락되면 parse에 실패한다', () => {
    const result = regionSchema.safeParse({ id: 'region-1', name: '서울특별시' });
    expect(result.success).toBe(false);
  });
});
