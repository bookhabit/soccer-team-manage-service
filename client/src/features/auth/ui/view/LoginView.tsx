import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { LoginInput } from "../../data/schemas/auth.schema";

interface LoginViewProps {
  control: Control<LoginInput>;
  errors: FieldErrors<LoginInput>;
  isPending: boolean;
  serverError: Error | null;
  onSubmit: () => void;
  onGoSignup: () => void;
}

/**
 * 로그인 스크린 UI.
 * 상태 로직 없이 props만 렌더링합니다.
 */
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
      <Text style={styles.title}>로그인</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="이메일"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              value={value}
              onChangeText={onChange}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="비밀번호"
              secureTextEntry
              autoCorrect={false}
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              value={value}
              onChangeText={onChange}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>
        )}
      />

      {serverError && (
        <Text style={styles.errorText}>{serverError.message}</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={onSubmit}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>로그인</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onGoSignup} style={styles.link}>
        <Text style={styles.linkText}>계정이 없으신가요? 회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 32,
    textAlign: "center",
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#2563eb",
    fontSize: 14,
  },
});
