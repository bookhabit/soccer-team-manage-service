import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { LoginInput } from '../../data/schemas/auth.schema';
import { TextField, Button, TextBox, colors, spacing } from '@ui';
import { router } from 'expo-router';

interface LoginViewProps {
  control: Control<LoginInput>;
  errors: FieldErrors<LoginInput>;
  isPending: boolean;
  serverError: Error | null;
  onSubmit: () => void;
  onGoSignup: () => void;
}

export function LoginView({
  control,
  errors,
  isPending,
  serverError,
  onSubmit,
  onGoSignup,
}: LoginViewProps) {
  return (
    <View style={styles.container}>
      <TextBox style={styles.title}>로그인</TextBox>

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
        name="password"
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextField
              title="비밀번호"
              placeholder="비밀번호를 입력하세요"
              secureTextEntry
              autoCorrect={false}
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              value={value}
              onChangeText={onChange}
              errorMessage={errors.password?.message}
            />
          </View>
        )}
      />

      {serverError && (
        <TextBox variant="caption" color={colors.error} style={styles.serverError}>
          {serverError.message}
        </TextBox>
      )}

      <View style={styles.submitWrapper}>
        <Button variant="primary" size="large" fullWidth loading={isPending} onPress={onSubmit}>
          로그인
        </Button>
      </View>

      {__DEV__ && (
        <View style={styles.submitWrapper}>
          <Button
            variant="secondary"
            size="large"
            fullWidth
            loading={isPending}
            onPress={() => router.push('/test-login')}
          >
            테스트 로그인
          </Button>
        </View>
      )}

      <TouchableOpacity onPress={onGoSignup} style={styles.link}>
        <TextBox variant="body2" color={colors.blue500}>
          계정이 없으신가요? 회원가입
        </TextBox>
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
