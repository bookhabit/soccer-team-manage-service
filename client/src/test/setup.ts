import { vi } from 'vitest';

// ─── expo-router ─────────────────────────────────────────────────────────────
vi.mock('expo-router', () => ({
  router: {
    replace: vi.fn(),
    push: vi.fn(),
    back: vi.fn(),
  },
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
    back: vi.fn(),
  }),
  useSegments: () => [],
  useLocalSearchParams: () => ({}),
  Redirect: () => null,
}));

// ─── expo-secure-store ───────────────────────────────────────────────────────
vi.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    setItemAsync: vi.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    getItemAsync: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    deleteItemAsync: vi.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
  };
});

// ─── react-native 네이티브 모듈 ──────────────────────────────────────────────
vi.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
vi.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// ─── @react-native-community/netinfo ─────────────────────────────────────────
vi.mock('@react-native-community/netinfo', () => ({
  default: {
    addEventListener: vi.fn(() => vi.fn()),
    fetch: vi.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
  },
}));
