import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useSignup } from "../../data/hooks/useAuth";
import { signupSchema } from "../../data/schemas/auth.schema";
import { SignupView } from "../view/SignupView";
import type { SignupInput } from "../../data/schemas/auth.schema";

/**
 * 회원가입 비즈니스 로직을 조립하고 SignupView에 주입하는 Container.
 */
export function SignupContainer() {
  const { mutate, isPending, error } = useSignup();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", nickname: "", password: "" },
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  return (
    <SignupView
      control={control}
      errors={errors}
      isPending={isPending}
      serverError={error}
      onSubmit={onSubmit}
      onGoLogin={() => router.push("/(auth)/login")}
    />
  );
}
