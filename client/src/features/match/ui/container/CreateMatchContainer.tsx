import React, { useState } from 'react';
import { TouchableOpacity, View, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useToast, Drawer, TextBox, Spacing, colors, spacing } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useMyClub } from '@/src/features/club/data/hooks/useClub';
import { useCreateMatch } from '../../data/hooks/useMatch';
import { MatchFormView } from '../view/MatchFormView';
import type { CreateMatchInput } from '../../data/schemas/match.schema';
import { useMyMatchPosts } from '@/src/features/matching/data/hooks/useMatchPosts';
import { LEVEL_LABEL } from '@/src/shared/constants/player.constants';
import type { MatchPostSummary } from '@/src/features/matching/data/schemas/matchPost.schema';

// ─── 매칭 데이터 → 경기 등록 defaultValues 변환 ────────────────────────────

function combineToISO(date: string, time: string): string {
  return `${date}T${time}:00`;
}

function matchPostToDefaultValues(post: MatchPostSummary): Partial<CreateMatchInput> {
  return {
    type: 'LEAGUE',
    location: post.location,
    address: post.address ?? undefined,
    startAt: combineToISO(
      post.matchDate.split('T')[0] ?? post.matchDate,
      post.startTime,
    ),
    endAt: combineToISO(
      post.matchDate.split('T')[0] ?? post.matchDate,
      post.endTime,
    ),
    opponentName: post.opponentClubName ?? undefined,
    opponentLevel: (post.opponentClubLevel as CreateMatchInput['opponentLevel']) ?? undefined,
  };
}

// ─── 매칭 선택 Drawer ────────────────────────────────────────────────────────

interface MatchPickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (post: MatchPostSummary) => void;
}

function MatchPickerDrawer({ isOpen, onClose, onSelect }: MatchPickerDrawerProps) {
  const { data } = useMyMatchPosts();
  const matchedPosts = (data?.items ?? []).filter((p) => p.status === 'MATCHED');
  const hasMatchedPosts = matchedPosts.length > 0;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="완료된 매칭에서 불러오기">
      {!hasMatchedPosts ? (
        <View style={drawerStyles.empty}>
          <TextBox variant="body2" color={colors.grey500}>
            완료된 매칭이 없습니다.
          </TextBox>
        </View>
      ) : (
        <ScrollView>
          {matchedPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={drawerStyles.item}
              onPress={() => {
                onSelect(post);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <TextBox variant="body2Bold" color={colors.grey900}>
                {post.opponentClubName ?? '상대팀'}
              </TextBox>
              <Spacing size={1} />
              <TextBox variant="caption" color={colors.grey500}>
                {new Date(post.matchDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                })}{' '}
                {post.startTime}–{post.endTime}
              </TextBox>
              <Spacing size={1} />
              <TextBox variant="caption" color={colors.grey500}>
                {post.location} ·{' '}
                {post.opponentClubLevel ? LEVEL_LABEL[post.opponentClubLevel] : ''}
              </TextBox>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </Drawer>
  );
}

const drawerStyles = StyleSheet.create({
  empty: {
    padding: spacing[5],
    alignItems: 'center',
  },
  item: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
});

// ─── Container ────────────────────────────────────────────────────────────────

function CreateMatchContent() {
  const { toast } = useToast();
  const { data: club } = useMyClub();
  const clubId = club?.id ?? '';

  const { mutate: createMatch, isPending } = useCreateMatch(clubId);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prefillKey, setPrefillKey] = useState(0);
  const [prefillValues, setPrefillValues] = useState<Partial<CreateMatchInput> | undefined>();

  const handleSelect = (post: MatchPostSummary) => {
    setPrefillValues(matchPostToDefaultValues(post));
    setPrefillKey((k) => k + 1);
  };

  const handleSubmit = (data: CreateMatchInput) => {
    createMatch(data, {
      onSuccess: () => {
        toast.success('경기가 등록되었습니다.');
        router.back();
      },
      onError: () => toast.error('경기 등록에 실패했습니다.'),
    });
  };

  const headerAction = (
    <TouchableOpacity
      style={headerStyles.button}
      onPress={() => setDrawerOpen(true)}
      activeOpacity={0.7}
    >
      <TextBox variant="body2Bold" color={colors.primary}>
        매칭에서 불러오기
      </TextBox>
    </TouchableOpacity>
  );

  return (
    <>
      <MatchFormView
        key={prefillKey}
        defaultValues={prefillValues}
        isSubmitting={isPending}
        submitLabel="경기 등록"
        headerAction={headerAction}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />

      <MatchPickerDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelect={handleSelect}
      />
    </>
  );
}

const headerStyles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
});

export function CreateMatchContainer() {
  return (
    <AsyncBoundary>
      <CreateMatchContent />
    </AsyncBoundary>
  );
}
