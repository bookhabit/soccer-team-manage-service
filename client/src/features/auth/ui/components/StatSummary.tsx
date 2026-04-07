import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';

interface StatItem {
  label: string;
  value: string | number;
}

interface StatSummaryProps {
  stats: StatItem[];
}

export function StatSummary({ stats }: StatSummaryProps) {
  return (
    <View style={styles.row}>
      {stats.map((item, idx) => (
        <React.Fragment key={item.label}>
          {idx > 0 && <View style={styles.divider} />}
          <View style={styles.cell}>
            <TextBox variant="heading2" color={colors.grey900}>
              {item.value}
            </TextBox>
            <TextBox variant="caption" color={colors.grey500} style={styles.label}>
              {item.label}
            </TextBox>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing[4],
  },
  cell: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    marginTop: spacing[1],
  },
  divider: {
    width: 1,
    backgroundColor: colors.grey200,
    alignSelf: 'stretch',
  },
});
