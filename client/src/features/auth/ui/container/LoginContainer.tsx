import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useLogin } from '../../data/hooks/useAuth';
import { loginSchema } from '../../data/schemas/auth.schema';
import { LoginView } from '../view/LoginView';
import type { LoginInput } from '../../data/schemas/auth.schema';

/**
 * 로그인 비즈니스 로직을 조립하고 LoginView에 주입하는 Container.
 */
export function LoginContainer() {
  const { mutate, isPending, error } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  return (
    <LoginView
      control={control}
      errors={errors}
      isPending={isPending}
      serverError={error}
      onSubmit={onSubmit}
      onGoSignup={() => router.push('/(auth)/signup')}
    />
  );
}
