import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/src/shared/query';
import { useAuthStore } from '@/src/shared/store';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(app)',
};

function RootLayoutNav() {
  const { isHydrated } = useAuthStore();

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
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
