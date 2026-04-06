import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@ui/foundation/colors';
import type { ListRowProps } from './ListRow.types';
import TextBox from '../TextBox';

export function ListRow({ left, title, description, right, onClick }: ListRowProps) {
  const content = (
    <>
      {left !== undefined && <View style={styles.leftSlot}>{left}</View>}
      <View style={styles.content}>
        <TextBox variant="body1" color={colors.grey900} numberOfLines={1}>
          {title}
        </TextBox>
        {description !== undefined && (
          <TextBox variant="body2" color={colors.grey500} style={styles.description} numberOfLines={1}>
            {description}
          </TextBox>
        )}
      </View>
      {right !== undefined && <View style={styles.rightSlot}>{right}</View>}
    </>
  );

  if (onClick !== undefined) {
    return (
      <TouchableOpacity style={styles.row} onPress={onClick} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.background,
  },
  leftSlot: { flexShrink: 0 },
  content: { flex: 1, minWidth: 0 },
  description: { marginTop: 2 },
  rightSlot: { flexShrink: 0 },
});
