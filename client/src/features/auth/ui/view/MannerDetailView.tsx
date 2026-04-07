import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  TextBox, Spacing, SafeAreaWrapper, Skeleton, colors, spacing,
} from '@ui';
import type { UserProfile } from '../../data/schemas/auth.schema';
import { MannerBadge } from '../components/MannerBadge';

interface MannerDetailViewProps {
  profile: UserProfile | undefined;
  isLoading: boolean;
}

function getMannerDescription(score: number): string {
  if (score >= 80) return '팀원들에게 매우 좋은 평가를 받고 있어요!';
  if (score >= 60) return '양호한 매너를 유지하고 있어요.';
  if (score >= 40) return '매너 향상이 필요합니다.';
  return '매너 점수가 낮습니다. 팀원들에게 더 배려해주세요.';
}

export function MannerDetailView({ profile, isLoading }: MannerDetailViewProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaWrapper>
          <View style={styles.content}>
            <Skeleton width="60%" height={32} borderRadius={8} />
            <Spacing size={4} />
            <Skeleton width="100%" height={120} borderRadius={16} />
          </View>
        </SafeAreaWrapper>
      </View>
    );
  }

  const score = profile?.mannerScore ?? 100;

  return (
    <View style={styles.container}>
      <SafeAreaWrapper>
        <ScrollView contentContainerStyle={styles.content}>
        <TextBox variant="heading2" color={colors.grey900}>매너 온도</TextBox>
        <Spacing size={6} />

        <View style={styles.scoreCard}>
          <MannerBadge score={score} />
          <Spacing size={4} />
          <TextBox variant="heading1" color={colors.grey900}>
            {score}°C
          </TextBox>
          <Spacing size={2} />
          <TextBox variant="body2" color={colors.grey500} style={styles.centered}>
            {getMannerDescription(score)}
          </TextBox>
        </View>

        <Spacing size={6} />

        <View style={styles.infoCard}>
          <TextBox variant="body2Bold" color={colors.grey900}>매너 온도란?</TextBox>
          <Spacing size={2} />
          <TextBox variant="body2" color={colors.grey600}>
            매너 온도는 경기 후 팀원들이 남기는 평가를 바탕으로 산정됩니다.
            기본값은 100°C이며, 긍정 평가를 받으면 올라가고
            부정 평가를 받으면 내려갑니다.
          </TextBox>
        </View>
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
  scoreCard: {
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 16,
    padding: spacing[6],
    alignItems: 'center',
  },
  centered: {
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.grey100,
    borderRadius: 16,
    padding: spacing[4],
  },
});
