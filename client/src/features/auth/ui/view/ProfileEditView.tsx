import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import {
  TextField, Select, Spacing,
  BottomCTASingle, ScreenLayout, TextBox, AvatarImage, colors, spacing,
} from '@ui';
import type { UpdateProfileInput } from '../../data/schemas/user.schema';
import {
  POSITION_OPTIONS,
  FOOT_OPTIONS,
  LEVEL_OPTIONS,
} from '@/src/shared/constants/player.constants';
import { getAvatarUrl } from '@/src/shared/utils/imageUrl';

interface ProfileEditViewProps {
  control: Control<UpdateProfileInput>;
  errors: FieldErrors<UpdateProfileInput>;
  isPending: boolean;
  isAvatarLoading: boolean;
  currentAvatarUrl: string | null;
  onAvatarPress: () => void;
  onAvatarDelete: () => void;
  onSubmit: () => void;
}

export function ProfileEditView({
  control,
  errors,
  isPending,
  isAvatarLoading,
  currentAvatarUrl,
  onAvatarPress,
  onAvatarDelete,
  onSubmit,
}: ProfileEditViewProps) {
  return (
    <ScreenLayout
      bottomSlot={<BottomCTASingle label="저장" onClick={onSubmit} loading={isPending} />}
    >
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextBox variant="heading2" color={colors.grey900} style={styles.title}>
          프로필 수정
        </TextBox>
        <Spacing size={4} />

        {/* 아바타 */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={onAvatarPress} disabled={isAvatarLoading} activeOpacity={0.7}>
            <View style={styles.avatarWrapper}>
              <AvatarImage source={{ uri: getAvatarUrl(currentAvatarUrl) }} size={88} />
              {isAvatarLoading ? (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color={colors.background} />
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
          <Spacing size={2} />
          <TextBox variant="caption" color={colors.blue500} onPress={onAvatarPress}>
            사진 변경
          </TextBox>
          {currentAvatarUrl ? (
            <>
              <Spacing size={1} />
              <TextBox variant="caption" color={colors.grey400} onPress={onAvatarDelete}>
                사진 삭제
              </TextBox>
            </>
          ) : null}
        </View>
        <Spacing size={6} />

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextField
              title="닉네임"
              placeholder="2~20자"
              value={value ?? ''}
              onChangeText={onChange}
              errorMessage={errors.name?.message}
            />
          )}
        />
        <Spacing size={4} />

        <Controller
          control={control}
          name="position"
          render={({ field: { onChange, value } }) => (
            <Select
              label="주 포지션"
              options={POSITION_OPTIONS}
              value={value ?? ''}
              onChange={onChange}
              errorMessage={errors.position?.message}
              placeholder="포지션 선택"
            />
          )}
        />
        <Spacing size={4} />

        <Controller
          control={control}
          name="foot"
          render={({ field: { onChange, value } }) => (
            <Select
              label="주 발"
              options={FOOT_OPTIONS}
              value={value ?? ''}
              onChange={onChange}
              errorMessage={errors.foot?.message}
              placeholder="선택"
            />
          )}
        />
        <Spacing size={4} />

        <Controller
          control={control}
          name="level"
          render={({ field: { onChange, value } }) => (
            <Select
              label="실력 수준"
              options={LEVEL_OPTIONS}
              value={value ?? ''}
              onChange={onChange}
              errorMessage={errors.level?.message}
              placeholder="실력 선택"
            />
          )}
        />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  content: {
    padding: spacing[6],
    paddingBottom: spacing[4],
  },
  title: { lineHeight: 30 },
  avatarSection: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 44,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
