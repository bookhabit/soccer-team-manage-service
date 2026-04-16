import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextBox, colors, spacing } from '@ui';
import type { PlayerPosition } from '../../data/schemas/mercenaryPost.schema';

const POSITIONS: { value: PlayerPosition; label: string }[] = [
  { value: 'FW', label: 'FW 공격수' },
  { value: 'MF', label: 'MF 미드필더' },
  { value: 'DF', label: 'DF 수비수' },
  { value: 'GK', label: 'GK 골키퍼' },
];

interface Props {
  value: PlayerPosition[];
  onChange: (value: PlayerPosition[]) => void;
}

export function PositionPicker({ value, onChange }: Props) {
  const toggle = (pos: PlayerPosition) => {
    if (value.includes(pos)) {
      onChange(value.filter((p) => p !== pos));
    } else {
      onChange([...value, pos]);
    }
  };

  return (
    <View style={styles.row}>
      {POSITIONS.map((p) => {
        const selected = value.includes(p.value);
        return (
          <TouchableOpacity
            key={p.value}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => toggle(p.value)}
            activeOpacity={0.7}
          >
            <TextBox
              variant="captionBold"
              color={selected ? colors.primary : colors.grey600}
            >
              {p.label}
            </TextBox>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.grey200,
    backgroundColor: colors.grey50,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.blue50,
  },
});
