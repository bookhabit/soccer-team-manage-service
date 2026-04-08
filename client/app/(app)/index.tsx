import { Redirect } from 'expo-router';

/**
 * /(app) 진입 시 탭 홈으로 리다이렉트.
 */
export default function AppIndex() {
  return <Redirect href="/(app)/(tabs)" />;
}
