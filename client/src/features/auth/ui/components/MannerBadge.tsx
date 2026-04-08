import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';

/** 매너 점수 색상 임계값 */
const SCORE_COLOR_THRESHOLDS = { DANGER: 20, WARNING: 50 } as const;

interface MannerBadgeProps {
  score: number;
}

/**
 * 매너 점수를 뱃지 형태로 표시한다. 점수 범위에 따라 색상이 변한다.
 * - ≤ 20: error(빨강)
 * - ≤ 50: warning(주황)
 * - > 50: primary(파랑)
 */
function getBadgeColor(score: number) {
  if (score <= SCORE_COLOR_THRESHOLDS.DANGER) return colors.error;
  if (score <= SCORE_COLOR_THRESHOLDS.WARNING) return colors.warning;
  return colors.primary;
}

export function MannerBadge({ score }: MannerBadgeProps) {
  const color = getBadgeColor(score);

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <TextBox variant="captionBold" color={color}>
        {score}°C
      </TextBox>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
});
