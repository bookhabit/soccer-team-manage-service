import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextBox from '../TextBox';
import { colors } from '../../../foundation/colors';
import { spacing } from '../../../foundation/spacing';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <TextBox variant="body2" color={colors.grey400}>
        {message}
      </TextBox>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
});
