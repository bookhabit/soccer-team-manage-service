import { createApiClient } from './createApiClient';
import { API_BASE_URL } from './baseUrl';
import { useAuthStore } from '../store/useAuthStore';

export const apiClient = createApiClient({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,
  refreshEndpoint: '/sessions/refresh',

  getAccessToken: () => useAuthStore.getState().accessToken,

  onTokenRefreshed: (accessToken) => {
    useAuthStore.getState().setAccessToken(accessToken);
  },

  onAuthFailure: () => {
    useAuthStore.getState().clearAuth();
  },
});

export const { http } = apiClient;
