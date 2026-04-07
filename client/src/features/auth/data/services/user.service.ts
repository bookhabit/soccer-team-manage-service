import { http, apiClient } from '@/src/shared/http/apiClient';
import { userProfileSchema, regionSchema } from '../schemas/auth.schema';
import { updateProfileSchema, withdrawSchema } from '../schemas/user.schema';
import type { UserProfile, Region } from '../schemas/auth.schema';
import type { UpdateProfileInput, WithdrawInput } from '../schemas/user.schema';
import { z } from 'zod';

export async function updateProfile(body: UpdateProfileInput): Promise<UserProfile> {
  return http.patch<UserProfile>('/users/me', updateProfileSchema.parse(body), userProfileSchema);
}

/** DELETE with body — http.delete는 body를 지원하지 않으므로 privateApi 직접 사용 */
export async function withdrawAccount(body: WithdrawInput): Promise<void> {
  await apiClient.privateApi.delete('/users/me', { data: withdrawSchema.parse(body) });
}

export async function getRegions(): Promise<Region[]> {
  const data = await http.get<unknown[]>('/regions');
  return z.array(regionSchema).parse(data);
}
