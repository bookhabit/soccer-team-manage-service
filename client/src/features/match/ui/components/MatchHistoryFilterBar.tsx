import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Chip, Switch, TextBox, colors, spacing } from '@ui';
import type { MatchHistoryFilter } from '../../data/schemas/match.schema';

interface MatchHistoryFilterBarProps {
  filter: MatchHistoryFilter;
  onChange: (filter: MatchHistoryFilter) => void;
}

type MatchTypeOption = 'ALL' | 'LEAGUE' | 'SELF';

const TYPE_OPTIONS: { value: MatchTypeOption; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'LEAGUE', label: '매칭전' },
  { value: 'SELF', label: '자체전' },
];

export function MatchHistoryFilterBar({ filter, onChange }: MatchHistoryFilterBarProps) {
  const activeType: MatchTypeOption = filter.type ?? 'ALL';

  const handleTypeChange = (type: MatchTypeOption) => {
    if (type === 'ALL') {
      const { type: _, ...rest } = filter;
      onChange(rest);
    } else {
      onChange({ ...filter, type });
    }
  };

  const handleMyMatchesToggle = () => {
    onChange({ ...filter, myMatches: !filter.myMatches });
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TYPE_OPTIONS.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            active={activeType === value}
            onPress={() => handleTypeChange(value)}
          />
        ))}

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <TextBox variant="caption" color={colors.grey700}>
            내가 뛴 경기
          </TextBox>
          <Switch checked={!!filter.myMatches} onChange={handleMyMatchesToggle} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.grey200,
    marginHorizontal: spacing[1],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[2],
  },
});
