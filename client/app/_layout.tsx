import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/src/shared/query';
import { useAuthStore, initNetworkListener } from '@/src/shared/store';
import { ToastProvider } from '@/src/shared/ui/components/feedback/Toast/Toast.context';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(app)',
};

function RootLayoutNav() {
  const { isHydrated, accessToken } = useAuthStore();

  const router = useRouter();
  console.log('isHydrated', isHydrated);
  console.log('accessToken', accessToken);

  useEffect(() => {
    if (!isHydrated) return;

    if (accessToken) {
      router.replace('/(app)/(tabs)' as any);
    } else {
      router.replace('/(auth)/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, accessToken]);

  if (!isHydrated) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(dev)" />
    </Stack>
  );
}

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);

  const [fontsLoaded] = useFonts({
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.ttf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.ttf'),
    'Pretendard-Light': require('../assets/fonts/Pretendard-Light.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
    'Roboto-Light': require('../assets/fonts/Roboto-Light.ttf'),
    BMJUA: require('../assets/fonts/BMJUA_ttf.ttf'),
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const unsubscribe = initNetworkListener();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RootLayoutNav />
        </ToastProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
