import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWithdraw } from '../../data/hooks/useAuth';
import { withdrawSchema } from '../../data/schemas/user.schema';
import type { WithdrawInput } from '../../data/schemas/user.schema';
import { WithdrawView } from '../view/WithdrawView';

export function WithdrawContainer() {
  const { mutate, isPending } = useWithdraw();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WithdrawInput>({
    resolver: zodResolver(withdrawSchema),
  });

  const onSubmit = handleSubmit((data) => {
    mutate(data);
  });

  return (
    <WithdrawView
      control={control}
      errors={errors}
      isPending={isPending}
      onSubmit={onSubmit}
    />
  );
}
