import { http } from '@/src/shared/http/apiClient';
import {
  MercenaryPostListSchema,
  MercenaryMyPostListSchema,
  MercenaryPostDetailSchema,
  MercenaryApplicationListSchema,
  MercenaryContactSchema,
} from '../schemas/mercenaryPost.schema';
import type {
  MercenaryPostList,
  MercenaryMyPostList,
  MercenaryPostDetail,
  MercenaryApplicationList,
  MercenaryContact,
  CreateMercenaryPostInput,
  UpdateMercenaryPostInput,
  MercenaryPostFilters,
  CreateMercenaryApplicationInput,
} from '../schemas/mercenaryPost.schema';

export async function getMercenaryPosts(filters: MercenaryPostFilters): Promise<MercenaryPostList> {
  return http.get<MercenaryPostList>('/mercenary-posts', filters as object, MercenaryPostListSchema);
}

export async function getMyMercenaryPosts(): Promise<MercenaryMyPostList> {
  return http.get<MercenaryMyPostList>('/mercenary-posts/my', undefined, MercenaryMyPostListSchema);
}

export async function getMercenaryPostDetail(id: string): Promise<MercenaryPostDetail> {
  return http.get<MercenaryPostDetail>(`/mercenary-posts/${id}`, undefined, MercenaryPostDetailSchema);
}

export async function createMercenaryPost(body: CreateMercenaryPostInput): Promise<{ id: string }> {
  return http.post<{ id: string }>('/mercenary-posts', body);
}

export async function updateMercenaryPost(id: string, body: UpdateMercenaryPostInput): Promise<void> {
  return http.patch<void>(`/mercenary-posts/${id}`, body);
}

export async function deleteMercenaryPost(id: string): Promise<void> {
  return http.delete<void>(`/mercenary-posts/${id}`);
}

export async function applyMercenaryPost(id: string, body: CreateMercenaryApplicationInput): Promise<void> {
  return http.post<void>(`/mercenary-posts/${id}/applications`, body);
}

export async function getMercenaryApplications(postId: string): Promise<MercenaryApplicationList> {
  return http.get<MercenaryApplicationList>(
    `/mercenary-posts/${postId}/applications`,
    undefined,
    MercenaryApplicationListSchema,
  );
}

export async function acceptMercenaryApplication(postId: string, appId: string): Promise<MercenaryContact> {
  return http.patch<MercenaryContact>(
    `/mercenary-posts/${postId}/applications/${appId}/accept`,
    {},
    MercenaryContactSchema,
  );
}

export async function rejectMercenaryApplication(postId: string, appId: string): Promise<void> {
  return http.patch<void>(`/mercenary-posts/${postId}/applications/${appId}/reject`, {});
}
