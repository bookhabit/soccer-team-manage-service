import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useMe, useLogout } from '@/src/features/auth/data/hooks/useAuth';
import { Button, TextBox, colors, spacing } from '@ui';

export default function HomeScreen() {
  const { data: me } = useMe();
  const { mutate: logout, isPending } = useLogout();

  return (
    <View style={styles.container}>
      <TextBox variant="heading2" color={colors.grey900} style={styles.greeting}>안녕하세요, {me?.name ?? '...'}님!</TextBox>
      <TextBox variant="body2" color={colors.grey500} style={styles.email}>{me?.email}</TextBox>

      <Button variant="danger" size="medium" loading={isPending} onPress={() => logout()}>
        로그아웃
      </Button>

      <View style={styles.devSection}>
        <TextBox variant="captionBold" color={colors.grey400} style={styles.devLabel}>DEV</TextBox>
        <Button
          variant="ghost"
          size="small"
          onPress={() => router.push('/(dev)/design-system' as any)}
        >
          🎨 Design System
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
    backgroundColor: colors.background,
  },
  greeting: { marginBottom: spacing[2] },
  email: { marginBottom: spacing[10] },
  devSection: {
    position: 'absolute',
    bottom: spacing[8],
    alignItems: 'center',
    gap: 4,
  },
  devLabel: { letterSpacing: 1 },
});
