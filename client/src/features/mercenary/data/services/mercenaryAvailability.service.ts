import { http } from '@/src/shared/http/apiClient';
import {
  MercenaryAvailabilityListSchema,
  MercenaryMyAvailabilityListSchema,
  MercenaryAvailabilityDetailSchema,
  MercenaryRecruitmentListSchema,
  MercenaryRecruitContactSchema,
} from '../schemas/mercenaryAvailability.schema';
import type {
  MercenaryAvailabilityList,
  MercenaryMyAvailabilityList,
  MercenaryAvailabilityDetail,
  MercenaryRecruitmentList,
  MercenaryRecruitContact,
  CreateMercenaryAvailabilityInput,
  UpdateMercenaryAvailabilityInput,
  MercenaryAvailabilityFilters,
  CreateMercenaryRecruitmentInput,
} from '../schemas/mercenaryAvailability.schema';

export async function getMercenaryAvailabilities(
  filters: MercenaryAvailabilityFilters,
): Promise<MercenaryAvailabilityList> {
  return http.get<MercenaryAvailabilityList>(
    '/mercenary-availabilities',
    filters as object,
    MercenaryAvailabilityListSchema,
  );
}

export async function getMyMercenaryAvailabilities(): Promise<MercenaryMyAvailabilityList> {
  return http.get<MercenaryMyAvailabilityList>(
    '/mercenary-availabilities/my',
    undefined,
    MercenaryMyAvailabilityListSchema,
  );
}

export async function getMyRecruitments(): Promise<MercenaryRecruitmentList> {
  return http.get<MercenaryRecruitmentList>(
    '/mercenary-availabilities/my-recruitments',
    undefined,
    MercenaryRecruitmentListSchema,
  );
}

export async function getMercenaryAvailabilityDetail(id: string): Promise<MercenaryAvailabilityDetail> {
  return http.get<MercenaryAvailabilityDetail>(
    `/mercenary-availabilities/${id}`,
    undefined,
    MercenaryAvailabilityDetailSchema,
  );
}

export async function createMercenaryAvailability(
  body: CreateMercenaryAvailabilityInput,
): Promise<{ id: string }> {
  return http.post<{ id: string }>('/mercenary-availabilities', body);
}

export async function updateMercenaryAvailability(
  id: string,
  body: UpdateMercenaryAvailabilityInput,
): Promise<void> {
  return http.patch<void>(`/mercenary-availabilities/${id}`, body);
}

export async function deleteMercenaryAvailability(id: string): Promise<void> {
  return http.delete<void>(`/mercenary-availabilities/${id}`);
}

export async function recruitMercenary(
  availId: string,
  body: CreateMercenaryRecruitmentInput,
): Promise<void> {
  return http.post<void>(`/mercenary-availabilities/${availId}/recruitments`, body);
}

export async function acceptMercenaryRecruitment(
  availId: string,
  recId: string,
): Promise<MercenaryRecruitContact> {
  return http.patch<MercenaryRecruitContact>(
    `/mercenary-availabilities/${availId}/recruitments/${recId}/accept`,
    {},
    MercenaryRecruitContactSchema,
  );
}

export async function rejectMercenaryRecruitment(availId: string, recId: string): Promise<void> {
  return http.patch<void>(`/mercenary-availabilities/${availId}/recruitments/${recId}/reject`, {});
}
