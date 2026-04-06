import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors } from '@ui/foundation/colors';
import { typography } from '@ui/foundation/typography';
import { ChevronDownIcon, CheckIcon } from '@ui/icons';
import type { SelectProps } from './Select.types';

export function Select({
  label,
  options,
  placeholder,
  errorMessage,
  fullWidth = true,
  value,
  onChange,
  disabled,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const hasError = errorMessage !== undefined;

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={fullWidth ? styles.wrapperFull : styles.wrapper}>
      {label !== undefined && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.trigger, hasError && styles.triggerError, disabled && styles.disabled]}
        onPress={() => !disabled && setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.triggerText, !selected && styles.placeholder]}>
          {selected ? selected.label : (placeholder ?? '선택하세요')}
        </Text>
        <ChevronDownIcon size={18} color={colors.grey500} />
      </TouchableOpacity>
      {hasError && <Text style={styles.errorMessage}>{errorMessage}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {label !== undefined && <Text style={styles.sheetTitle}>{label}</Text>}
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, item.disabled && styles.optionDisabled]}
                onPress={() => !item.disabled && handleSelect(item.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, item.value === value && styles.optionSelected]}>
                  {item.label}
                </Text>
                {item.value === value && (
                  <CheckIcon size={18} color={colors.blue500} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  wrapperFull: { width: '100%' },
  label: { ...typography.body2Bold, color: colors.grey700, marginBottom: 4 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.grey200,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  triggerError: { borderColor: colors.error },
  disabled: { backgroundColor: colors.grey100, opacity: 0.6 },
  triggerText: { ...typography.body1, flex: 1, color: colors.grey900 },
  placeholder: { color: colors.grey400 },
  errorMessage: { ...typography.caption, color: colors.error, marginTop: 4 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grey200,
    alignSelf: 'center',
    marginVertical: 12,
  },
  sheetTitle: {
    ...typography.heading3,
    color: colors.grey900,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionDisabled: { opacity: 0.4 },
  optionText: { ...typography.body1, flex: 1, color: colors.grey900 },
  optionSelected: { color: colors.blue500, fontWeight: '600' },
});
