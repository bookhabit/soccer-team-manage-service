import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import {
  TextBox, TextField, TextArea, Select, Switch, Spacing,
  BottomCTASingle, ScreenLayout, colors, spacing,
} from '@ui';
import type { CreatePostInput } from '../../data/schemas/post.schema';

const POST_TYPE_OPTIONS = [
  { value: 'GENERAL', label: '일반' },
  { value: 'NOTICE', label: '공지' },
  { value: 'INQUIRY', label: '문의' },
];

interface PostWriteViewProps {
  isEdit: boolean;
  control: Control<CreatePostInput>;
  errors: FieldErrors<CreatePostInput>;
  isPending: boolean;
  onSubmit: () => void;
}

/**
 * 게시글 작성·수정 View — 제목·본문 입력 + 타입·고정·알림 옵션.
 */
export function PostWriteView({
  isEdit,
  control,
  errors,
  isPending,
  onSubmit,
}: PostWriteViewProps) {
  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <Select
              label="게시글 유형"
              options={POST_TYPE_OPTIONS}
              value={value}
              onChange={onChange}
              errorMessage={errors.type?.message}
            />
          )}
        />

        <Spacing size={4} />

        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextField
              title="제목"
              placeholder="제목을 입력하세요"
              value={value}
              onChangeText={onChange}
              errorMessage={errors.title?.message}
              maxLength={100}
            />
          )}
        />

        <Spacing size={4} />

        <Controller
          control={control}
          name="content"
          render={({ field: { onChange, value } }) => (
            <TextArea
              title="내용"
              placeholder="내용을 입력하세요"
              value={value}
              onChangeText={onChange}
              errorMessage={errors.content?.message}
              maxLength={2000}
            />
          )}
        />

        <Spacing size={5} />

        <View style={styles.toggleRow}>
          <TextBox variant="body2" color={colors.grey700}>공지 고정</TextBox>
          <Controller
            control={control}
            name="isPinned"
            render={({ field: { onChange, value } }) => (
              <Switch checked={value} onChange={onChange} />
            )}
          />
        </View>

        <Spacing size={3} />

        <View style={styles.toggleRow}>
          <View>
            <TextBox variant="body2" color={colors.grey700}>팀원 알림 전송</TextBox>
            <TextBox variant="caption" color={colors.grey500}>등록 시 팀원에게 푸시 알림을 보냅니다</TextBox>
          </View>
          <Controller
            control={control}
            name="sendNotification"
            render={({ field: { onChange, value } }) => (
              <Switch checked={value} onChange={onChange} />
            )}
          />
        </View>

        <Spacing size={20} />
      </ScrollView>

      <BottomCTASingle
        label={isEdit ? '수정 완료' : '게시글 등록'}
        onClick={onSubmit}
        loading={isPending}
        safeArea
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[5],
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
});
