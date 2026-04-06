import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@ui/foundation/colors';
import { typography } from '@ui/foundation/typography';
import { CloseIcon } from '@ui/icons';
import type { TextFieldProps } from './TextField.types';
import TextBox from '../TextBox';

export function TextField({
  title,
  description,
  errorMessage,
  clearButton = false,
  onClear,
  fullWidth = true,
  maxLength,
  value,
  style,
  ...rest
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const currentLength = typeof value === 'string' ? value.length : 0;
  const showClear = clearButton && currentLength > 0;
  const showLength = maxLength !== undefined;
  const hasError = errorMessage !== undefined;

  return (
    <View style={fullWidth ? styles.wrapperFull : styles.wrapper}>
      {title !== undefined && <TextBox variant="body2Bold" color={colors.grey700} style={styles.titleMargin}>{title}</TextBox>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            hasError && styles.inputError,
            (showClear || showLength) && styles.inputWithRight,
            style,
          ]}
          value={value}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.grey400}
          {...rest}
        />
        <View style={styles.rightAccessory}>
          {showClear && (
            <TouchableOpacity style={styles.clearButton} onPress={onClear} activeOpacity={0.7}>
              <CloseIcon size={12} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          {showLength && (
            <TextBox variant="caption" color={colors.grey400}>
              {currentLength}/{maxLength}
            </TextBox>
          )}
        </View>
      </View>
      {hasError && <TextBox variant="caption" color={colors.error} style={styles.captionMargin}>{errorMessage}</TextBox>}
      {!hasError && description !== undefined && (
        <TextBox variant="caption" color={colors.grey500} style={styles.captionMargin}>{description}</TextBox>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  wrapperFull: { width: '100%' },
  titleMargin: { marginBottom: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    ...typography.body1,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.grey200,
    borderRadius: 10,
    backgroundColor: colors.background,
    color: colors.grey900,
  },
  inputFocused: {
    borderColor: colors.blue500,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputWithRight: {
    paddingRight: 44,
  },
  rightAccessory: {
    position: 'absolute',
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.grey300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionMargin: { marginTop: 4 },
});
