import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';

interface MannerBadgeProps {
  score: number;
}

function getBadgeColor(score: number) {
  if (score <= 20) return colors.error;
  if (score <= 50) return colors.warning;
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
