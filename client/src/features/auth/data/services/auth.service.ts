import { http } from '@/src/shared/http/apiClient';
import {
  loginSchema,
  signupSchema,
  accessTokenResponseSchema,
  signupResponseSchema,
  userProfileSchema,
  onboardingSchema,
} from '../schemas/auth.schema';
import type {
  LoginInput,
  SignupInput,
  AccessTokenResponse,
  SignupResponse,
  UserProfile,
  OnboardingInput,
} from '../schemas/auth.schema';

export async function login(body: LoginInput): Promise<AccessTokenResponse> {
  return http.auth.post<AccessTokenResponse>('/sessions', loginSchema.parse(body), accessTokenResponseSchema);
}

export async function signup(body: SignupInput): Promise<SignupResponse> {
  return http.auth.post<SignupResponse>('/sessions/signup', signupSchema.parse(body), signupResponseSchema);
}

export async function logout(): Promise<void> {
  await http.delete('/sessions');
}

export async function getMe(): Promise<UserProfile> {
  return http.get<UserProfile>('/users/me', undefined, userProfileSchema);
}

export async function saveOnboarding(body: OnboardingInput): Promise<UserProfile> {
  return http.patch<UserProfile>('/users/me/onboarding', onboardingSchema.parse(body), userProfileSchema);
}
