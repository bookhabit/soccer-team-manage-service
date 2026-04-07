import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { SignupInput } from '../../data/schemas/auth.schema';
import { TextField, Button, TextBox, colors, spacing } from '@ui';

interface SignupViewProps {
  control: Control<SignupInput>;
  errors: FieldErrors<SignupInput>;
  isPending: boolean;
  serverError: Error | null;
  onSubmit: () => void;
  onGoLogin: () => void;
}

export function SignupView({
  control,
  errors,
  isPending,
  serverError,
  onSubmit,
  onGoLogin,
}: SignupViewProps) {
  return (
    <View style={styles.container}>
      <TextBox style={styles.title}>회원가입</TextBox>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextField
              title="이메일"
              placeholder="이메일을 입력하세요"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              value={value}
              onChangeText={onChange}
              errorMessage={errors.email?.message}
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextField
              title="닉네임"
              placeholder="닉네임 (2~20자)"
              value={value}
              onChangeText={onChange}
              errorMessage={errors.name?.message}
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextField
              title="비밀번호"
              placeholder="비밀번호 (8자 이상)"
              secureTextEntry
              autoCorrect={false}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              value={value}
              onChangeText={onChange}
              errorMessage={errors.password?.message}
            />
          </View>
        )}
      />

      {serverError && <TextBox variant="caption" color={colors.error} style={styles.serverError}>{serverError.message}</TextBox>}

      <View style={styles.submitWrapper}>
        <Button variant="primary" size="large" fullWidth loading={isPending} onPress={onSubmit}>
          회원가입
        </Button>
      </View>

      <TouchableOpacity onPress={onGoLogin} style={styles.link}>
        <TextBox variant="body2" color={colors.blue500}>이미 계정이 있으신가요? 로그인</TextBox>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing[6],
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing[8],
    textAlign: 'center',
    color: colors.grey900,
  },
  fieldWrapper: {
    marginBottom: spacing[4],
  },
  serverError: { marginBottom: spacing[3] },
  submitWrapper: {
    marginTop: spacing[2],
  },
  link: {
    marginTop: spacing[5],
    alignItems: 'center',
  },
});
