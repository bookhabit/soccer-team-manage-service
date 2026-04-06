import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors } from '@ui/foundation/colors';
import { typography } from '@ui/foundation/typography';
import type { TextAreaProps } from './TextField.types';
import TextBox from '../TextBox';

export function TextArea({
  title,
  description,
  errorMessage,
  maxLength,
  value,
  style,
  ...rest
}: TextAreaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const currentLength = typeof value === 'string' ? value.length : 0;
  const hasError = errorMessage !== undefined;

  return (
    <View style={styles.wrapper}>
      {title !== undefined && <TextBox variant="body2Bold" color={colors.grey700} style={styles.titleMargin}>{title}</TextBox>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
          style,
        ]}
        value={value}
        maxLength={maxLength}
        multiline
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor={colors.grey400}
        textAlignVertical="top"
        {...rest}
      />
      <View style={styles.footer}>
        {hasError && <TextBox variant="caption" color={colors.error}>{errorMessage}</TextBox>}
        {!hasError && description !== undefined && (
          <TextBox variant="caption" color={colors.grey500}>{description}</TextBox>
        )}
        {maxLength !== undefined && (
          <TextBox variant="caption" color={colors.grey400}>
            {currentLength}/{maxLength}
          </TextBox>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  titleMargin: { marginBottom: 4 },
  input: {
    ...typography.body1,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.grey200,
    borderRadius: 10,
    backgroundColor: colors.background,
    color: colors.grey900,
    minHeight: 120,
  },
  inputFocused: { borderColor: colors.blue500 },
  inputError: { borderColor: colors.error },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
});
