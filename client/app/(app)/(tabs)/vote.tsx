import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';

/**
 * 투표 탭 화면 (준비 중).
 */
export default function VoteScreen() {
  return (
    <View style={styles.container}>
      <TextBox variant="heading3" color={colors.grey900}>투표</TextBox>
      <TextBox variant="body2" color={colors.grey400} style={styles.sub}>
        준비 중입니다.
      </TextBox>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing[2],
  },
  sub: {
    marginTop: spacing[1],
  },
});
