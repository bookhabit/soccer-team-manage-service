import { http } from '@/src/shared/http/apiClient';
import { uploadResponseSchema } from '../schemas/upload.schema';
import type { UploadResponse } from '../schemas/upload.schema';

export async function uploadAvatar(formData: FormData): Promise<UploadResponse> {
  const data = await http.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return uploadResponseSchema.parse(data);
}

export async function deleteAvatar(): Promise<void> {
  await http.delete('/upload/avatar');
}

export async function uploadClubLogo(
  clubId: string,
  formData: FormData,
): Promise<UploadResponse> {
  const data = await http.post(`/upload/club-logo/${clubId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return uploadResponseSchema.parse(data);
}

export async function deleteClubLogo(clubId: string): Promise<void> {
  await http.delete(`/upload/club-logo/${clubId}`);
}
