import { http, apiClient } from "@/src/shared/http";
import type {
  LoginInput,
  SignupInput,
  AccessTokenResponse,
  SignupResponse,
  UserProfile,
} from "../schemas/auth.schema";
import {
  accessTokenResponseSchema,
  signupResponseSchema,
  userProfileSchema,
} from "../schemas/auth.schema";

/**
 * 로그인 — accessToken은 body, refreshToken은 httpOnly 쿠키로 수신
 */
export async function login(body: LoginInput): Promise<AccessTokenResponse> {
  console.log("login service called with", body);
  return apiClient.http.auth.post<AccessTokenResponse>(
    "/sessions",
    body,
    accessTokenResponseSchema,
  );
}

/**
 * 회원가입
 */
export async function signup(body: SignupInput): Promise<SignupResponse> {
  return apiClient.http.auth.post<SignupResponse>(
    "/users",
    body,
    signupResponseSchema,
  );
}

/**
 * 로그아웃 — DB 세션 삭제 + RT 쿠키 제거
 */
export async function logout(): Promise<void> {
  await http.delete("/sessions");
}

/**
 * 내 프로필 조회
 */
export async function getMe(): Promise<UserProfile> {
  return http.get<UserProfile>("/users/me", undefined, userProfileSchema);
}
