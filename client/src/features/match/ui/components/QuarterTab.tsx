import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { TextBox, colors, spacing } from '@ui';

interface QuarterTabProps {
  quarters: number[];
  activeQuarter: number;
  onSelect: (quarter: number) => void;
  onAdd?: () => void;
  onRemove?: (quarter: number) => void;
}

export function QuarterTab({ quarters, activeQuarter, onSelect, onAdd, onRemove }: QuarterTabProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {quarters.map((q) => {
        const isActive = q === activeQuarter;
        return (
          <View key={q} style={styles.tabWrapper}>
            <TouchableOpacity
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
            {/* 삭제 버튼 — 2쿼터 이상일 때만 표시 */}
            {onRemove && quarters.length > 1 ? (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => onRemove(q)}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <TextBox variant="caption" color={colors.grey400}>×</TextBox>
              </TouchableOpacity>
            ) : null}
          </View>
        );
      })}

      {/* 쿼터 추가 버튼 */}
      {onAdd ? (
        <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.7}>
          <TextBox variant="body2Bold" color={colors.blue500}>+ 쿼터</TextBox>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  tabWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
  removeBtn: {
    marginLeft: 2,
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[1],
  },
  addBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.blue200,
    borderStyle: 'dashed',
  },
});
