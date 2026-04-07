import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  TextBox, Button, Spacing, SafeAreaWrapper, Skeleton, colors, spacing,
} from '@ui';
import type { UserProfile } from '../../data/schemas/auth.schema';
import { PlayerCard } from '../components/PlayerCard';
import { StatSummary } from '../components/StatSummary';

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: '입문',
  AMATEUR: '아마추어',
  SEMI_PRO: '세미프로',
  PRO: '프로',
};

const FOOT_LABEL: Record<string, string> = {
  LEFT: '왼발',
  RIGHT: '오른발',
  BOTH: '양발',
};

interface ProfileViewProps {
  profile: UserProfile | undefined;
  isLoading: boolean;
  onEditPress: () => void;
  onMannerPress: () => void;
  onSettingsPress: () => void;
  onLogout: () => void;
}

export function ProfileView({
  profile,
  isLoading,
  onEditPress,
  onMannerPress,
  onSettingsPress,
  onLogout,
}: ProfileViewProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaWrapper>
          <View style={styles.content}>
            <Skeleton width="100%" height={100} borderRadius={16} />
            <Spacing size={4} />
            <Skeleton width="100%" height={80} borderRadius={16} />
          </View>
        </SafeAreaWrapper>
      </View>
    );
  }

  const stats = [
    { label: '경력', value: profile?.years !== null && profile?.years !== undefined ? `${profile.years}년` : '-' },
    { label: '실력', value: profile?.level ? (LEVEL_LABEL[profile.level] ?? '-') : '-' },
    { label: '주 발', value: profile?.foot ? (FOOT_LABEL[profile.foot] ?? '-') : '-' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaWrapper>
        <ScrollView contentContainerStyle={styles.content}>
          {/* 헤더 */}
          <View style={styles.header}>
            <TextBox variant="heading2" color={colors.grey900}>내 프로필</TextBox>
            <TouchableOpacity onPress={onSettingsPress}>
              <TextBox variant="body2" color={colors.grey500}>설정</TextBox>
            </TouchableOpacity>
          </View>

          <Spacing size={4} />

          {/* 플레이어 카드 */}
          <PlayerCard
            name={profile?.name ?? null}
            position={profile?.position ?? null}
            avatarUrl={profile?.avatarUrl ?? null}
            mannerScore={profile?.mannerScore ?? 100}
          />

          <Spacing size={4} />

          {/* 통계 요약 */}
          <View style={styles.statsCard}>
            <StatSummary stats={stats} />
          </View>

          <Spacing size={4} />

          {/* 매너 온도 섹션 */}
          <TouchableOpacity style={styles.mannerCard} onPress={onMannerPress}>
            <View style={styles.mannerRow}>
              <View>
                <TextBox variant="body2Bold" color={colors.grey900}>매너 온도</TextBox>
                <Spacing size={1} />
                <TextBox variant="caption" color={colors.grey500}>
                  매너 온도는 팀원들의 평가로 결정됩니다
                </TextBox>
              </View>
              <TextBox variant="body2" color={colors.grey400}>{'>'}</TextBox>
            </View>
          </TouchableOpacity>

          <Spacing size={6} />

          {/* 액션 버튼들 */}
          <Button variant="secondary" onPress={onEditPress}>
            프로필 수정
          </Button>
          <Spacing size={3} />
          <Button variant="ghost" onPress={onLogout}>
            로그아웃
          </Button>
        </ScrollView>
      </SafeAreaWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing[5],
    paddingBottom: spacing[10],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsCard: {
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 16,
    backgroundColor: colors.background,
  },
  mannerCard: {
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 16,
    padding: spacing[4],
    backgroundColor: colors.background,
  },
  mannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
