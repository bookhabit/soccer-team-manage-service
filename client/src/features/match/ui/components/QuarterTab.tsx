import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { TextBox, colors, spacing } from '@ui';

interface QuarterTabProps {
  quarters: number[];
  activeQuarter: number;
  onSelect: (quarter: number) => void;
}

export function QuarterTab({ quarters, activeQuarter, onSelect }: QuarterTabProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {quarters.map((q) => {
        const isActive = q === activeQuarter;
        return (
          <TouchableOpacity
            key={q}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSelect(q)}
            activeOpacity={0.7}
          >
            <TextBox
              variant={isActive ? 'body2Bold' : 'body2'}
              color={isActive ? colors.blue500 : colors.grey500}
            >
              {q}쿼터
            </TextBox>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  tab: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.grey200,
  },
  tabActive: {
    borderColor: colors.blue500,
    backgroundColor: colors.blue50,
  },
});
