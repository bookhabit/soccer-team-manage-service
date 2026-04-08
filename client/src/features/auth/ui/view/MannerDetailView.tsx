import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  TextBox, Spacing, ScreenLayout, Skeleton, colors, spacing,
} from '@ui';
import type { UserProfile } from '../../data/schemas/auth.schema';
import { MannerBadge } from '../components/MannerBadge';

/** 매너 점수 설명 텍스트 임계값 */
const SCORE_DESCRIPTION_THRESHOLDS = { GREAT: 80, GOOD: 60, FAIR: 40 } as const;

interface MannerDetailViewProps {
  profile: UserProfile | undefined;
  isLoading: boolean;
}

/**
 * 매너 점수에 따른 안내 문구를 반환한다.
 * - ≥ 80: 매우 좋음
 * - ≥ 60: 양호
 * - ≥ 40: 향상 필요
 * - < 40: 낮음
 */
function getMannerDescription(score: number): string {
  if (score >= SCORE_DESCRIPTION_THRESHOLDS.GREAT) return '팀원들에게 매우 좋은 평가를 받고 있어요!';
  if (score >= SCORE_DESCRIPTION_THRESHOLDS.GOOD) return '양호한 매너를 유지하고 있어요.';
  if (score >= SCORE_DESCRIPTION_THRESHOLDS.FAIR) return '매너 향상이 필요합니다.';
  return '매너 점수가 낮습니다. 팀원들에게 더 배려해주세요.';
}

export function MannerDetailView({ profile, isLoading }: MannerDetailViewProps) {
  if (isLoading) {
    return (
      <ScreenLayout>
        <View style={styles.content}>
          <Skeleton width="60%" height={32} borderRadius={8} />
          <Spacing size={4} />
          <Skeleton width="100%" height={120} borderRadius={16} />
        </View>
      </ScreenLayout>
    );
  }

  const score = profile?.mannerScore ?? 100;

  return (
    <ScreenLayout>
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
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
