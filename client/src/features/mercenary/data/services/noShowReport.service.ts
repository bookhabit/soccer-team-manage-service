import { http } from '@/src/shared/http/apiClient';

export type CreateNoShowReportInput = {
  reportedUserId: string;
  applicationId?: string;
  recruitmentId?: string;
  reason: string;
};

export async function createNoShowReport(body: CreateNoShowReportInput): Promise<void> {
  return http.post<void>('/no-show-reports', body);
}
