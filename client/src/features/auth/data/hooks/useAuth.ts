import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { login, signup, logout, getMe, saveOnboarding } from '../services/auth.service';
import { updateProfile, withdrawAccount, getRegions } from '../services/user.service';
import type { LoginInput, SignupInput, OnboardingInput } from '../schemas/auth.schema';
import type { UpdateProfileInput, WithdrawInput } from '../schemas/user.schema';

export const AUTH_QUERY_KEYS = {
  me: ['auth', 'me'] as const,
  regions: ['regions'] as const,
};

// ─── 인증 ────────────────────────────────────────────────────────────────────

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LoginInput) => login(body),
    onSuccess: ({ accessToken, refreshToken }) => {
      setTokens(accessToken, refreshToken);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      router.replace('/(app)');
    },
  });
}

export function useSignup() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SignupInput) => signup(body),
    onSuccess: ({ accessToken, refreshToken }) => {
      setTokens(accessToken, refreshToken);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      router.replace('/(app)');
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

// ─── 온보딩 ──────────────────────────────────────────────────────────────────

export function useOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: OnboardingInput) => saveOnboarding(body),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, updatedProfile);
      router.replace('/(app)');
    },
  });
}

// ─── 프로필 ──────────────────────────────────────────────────────────────────

export function useMyProfile() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: getMe,
    enabled: !!accessToken,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProfileInput) => updateProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
    },
  });
}

// ─── 회원 탈퇴 ───────────────────────────────────────────────────────────────

export function useWithdraw() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: WithdrawInput) => withdrawAccount(body),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

// ─── 지역 ────────────────────────────────────────────────────────────────────

export function useRegions() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.regions,
    queryFn: getRegions,
    staleTime: Infinity, // seed 데이터 — 변경 없음
  });
}

