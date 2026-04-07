import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isHydrated: false,

  setTokens: (accessToken, refreshToken) => {
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    set({ accessToken, refreshToken });
  },

  clearAuth: () => {
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({ accessToken: null, refreshToken: null });
  },

  hydrate: async () => {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);
    set({ accessToken: accessToken ?? null, refreshToken: refreshToken ?? null, isHydrated: true });
  },
}));
