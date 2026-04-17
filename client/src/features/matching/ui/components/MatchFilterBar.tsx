import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip, colors, spacing } from '@ui';
import type { MatchPostFilters } from '../../data/schemas/matchPost.schema';

const LEVEL_CHIPS = [
  { value: undefined, label: '전체 레벨' },
  { value: 'BEGINNER', label: '입문' },
  { value: 'AMATEUR', label: '아마추어' },
  { value: 'SEMI_PRO', label: '세미프로' },
  { value: 'PRO', label: '프로' },
] as const;

const GENDER_CHIPS = [
  { value: undefined, label: '성별 무관' },
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
  { value: 'MIXED', label: '혼성' },
] as const;

const FEE_CHIPS = [
  { value: undefined, label: '전체' },
  { value: false, label: '무료' },
  { value: true, label: '유료' },
] as const;

interface MatchFilterBarProps {
  filters: Omit<MatchPostFilters, 'cursor' | 'limit' | 'dateFrom' | 'dateTo'>;
  onChange: (next: Partial<MatchPostFilters>) => void;
}

/**
 * 매칭 목록 필터 바. 레벨·성별·참가비를 수평 스크롤 칩으로 제공한다.
 */
export function MatchFilterBar({ filters, onChange }: MatchFilterBarProps) {
  return (
    <View style={styles.wrapper}>
      {/* 레벨 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {LEVEL_CHIPS.map((chip) => {
          const isActive = filters.level === chip.value;
          return (
            <Chip
              key={chip.label}
              label={chip.label}
              active={isActive}
              onPress={() => onChange({ level: chip.value })}
            />
          );
        })}
      </ScrollView>

      {/* 성별 + 구장비 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {GENDER_CHIPS.map((chip) => {
          const isActive = filters.gender === chip.value;
          return (
            <Chip
              key={chip.label}
              label={chip.label}
              active={isActive}
              onPress={() => onChange({ gender: chip.value })}
            />
          );
        })}
        <View style={styles.divider} />
        {FEE_CHIPS.map((chip) => {
          const isActive = filters.hasFee === chip.value;
          return (
            <Chip
              key={chip.label}
              label={chip.label}
              active={isActive}
              onPress={() => onChange({ hasFee: chip.value })}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
    paddingVertical: spacing[2],
  },
  row: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    paddingVertical: spacing[1],
  },
  divider: {
    width: 1,
    backgroundColor: colors.grey200,
    marginHorizontal: spacing[1],
  },
});
