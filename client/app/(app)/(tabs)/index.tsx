import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useMyProfile } from '@/src/features/auth/data/hooks/useAuth';
import { TextBox, Spacing, AvatarImage, colors, spacing } from '@ui';

/**
 * 홈 탭 화면.
 */
export default function HomeScreen() {
  const { data: me } = useMyProfile();

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TextBox variant="heading2" color={colors.grey900}>FC Flow</TextBox>
        <TouchableOpacity onPress={() => router.push('/(app)/profile/settings' as Href)}>
          <AvatarImage
            source={me?.avatarUrl ? { uri: me.avatarUrl } : null}
            size={36}
          />
        </TouchableOpacity>
      </View>

      {/* 환영 메시지 */}
      <Spacing size={4} />
      <TextBox variant="body1" color={colors.grey900}>
        안녕하세요, {me?.name ?? '...'}님! 👋
      </TextBox>
      <Spacing size={1} />
      <TextBox variant="body2" color={colors.grey500}>
        오늘도 즐거운 축구 되세요.
      </TextBox>

      {/* TODO: 홈 대시보드 (매치 예정, 공지 등) */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: spacing[5],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
