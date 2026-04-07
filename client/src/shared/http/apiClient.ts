import { createApiClient } from './createApiClient';
import { API_BASE_URL } from './baseUrl';
import { useAuthStore } from '../store/useAuthStore';

export const apiClient = createApiClient({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,
  refreshEndpoint: '/sessions/refresh',

  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,

  onTokenRefreshed: (accessToken, refreshToken) => {
    const store = useAuthStore.getState();
    // 서버가 RT를 새로 발급한 경우에만 갱신, 아니면 기존 RT 유지
    store.setTokens(accessToken, refreshToken || store.refreshToken || '');
  },

  onAuthFailure: () => {
    useAuthStore.getState().clearAuth();
  },
});

export const { http } = apiClient;
