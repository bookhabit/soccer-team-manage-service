import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';

interface AuthState {
  accessToken: string | null;
  isHydrated: boolean;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isHydrated: false,

  setAccessToken: (token) => {
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    set({ accessToken: token });
  },

  clearAuth: () => {
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    set({ accessToken: null });
  },

  hydrate: async () => {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    set({ accessToken: token ?? null, isHydrated: true });
  },
}));
