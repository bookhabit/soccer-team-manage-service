import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useAuthStore } from "@/src/shared/store/useAuthStore";
import { login, signup, logout, getMe } from "../services/auth.service";
import type { LoginInput, SignupInput } from "../schemas/auth.schema";

export const AUTH_QUERY_KEYS = {
  me: ["auth", "me"] as const,
};

/**
 * 로그인 뮤테이션.
 * 성공 시 accessToken을 SecureStore에 저장하고 앱 홈으로 이동합니다.
 */
export function useLogin() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LoginInput) => login(body),
    onSuccess: ({ accessToken }) => {
      console.log("login successful, received accessToken:", accessToken);
      setAccessToken(accessToken);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      router.replace("/(app)");
    },
    onError: (error) => {
      // 로그인 실패 시 토큰 제거 (예: 만료된 토큰으로 재로그인 시도)
      console.log(error.message);
    },
  });
}

/**
 * 회원가입 뮤테이션.
 * 성공 시 로그인 화면으로 이동합니다.
 */
export function useSignup() {
  return useMutation({
    mutationFn: (body: SignupInput) => signup(body),
    onSuccess: () => {
      router.replace("/(auth)/login");
    },
  });
}

/**
 * 로그아웃 뮤테이션.
 * 서버 세션 삭제 후 토큰을 제거하고 로그인 화면으로 이동합니다.
 */
export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      router.replace("/(auth)/login");
    },
  });
}

/**
 * 내 프로필 조회 쿼리.
 * accessToken이 있을 때만 활성화됩니다.
 */
export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: getMe,
    enabled: !!accessToken,
  });
}
