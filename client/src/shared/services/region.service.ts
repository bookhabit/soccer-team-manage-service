import { apiClient } from '../http/apiClient';

export interface Region {
  id: string;
  name: string; // 시도 (예: 서울특별시)
  sigungu: string; // 시군구 (예: 강남구)
}

export async function getRegions(): Promise<Region[]> {
  try {
    const res = await apiClient.publicApi.get<Region[]>('/regions');

    return res.data;
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    throw error;
  }
}
