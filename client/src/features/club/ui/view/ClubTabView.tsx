import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { TextBox, Button, Spacing, AvatarImage, Skeleton, ScreenLayout, colors, spacing } from '@ui';
import { RecruitmentBadge } from '../components/RecruitmentBadge';
import { ClubStatsBar } from '../components/ClubStatsBar';
import type { ClubDetail } from '../../data/schemas/club.schema';
import { LEVEL_LABEL } from '@/src/shared/constants/player.constants';

interface ClubTabViewProps {
  club: ClubDetail | null | undefined;
  isLoading: boolean;
  isError?: boolean;
  onCreateClub: () => void;
  onSearchClub: () => void;
  onJoinByCode: () => void;
  onGoMembers: () => void;
  onGoBoard: () => void;
  onGoSettings: () => void;
  onGoJoinRequests: () => void;
}

/**
 * 클럽 탭 홈 View.
 * - 로딩: Skeleton
 * - 미소속: NoClubView (생성·검색·코드 입력 CTA)
 * - 소속: 클럽 대시보드
 */
export function ClubTabView({
  club,
  isLoading,
  isError,
  onCreateClub,
  onSearchClub,
  onJoinByCode,
  onGoMembers,
  onGoBoard,
  onGoSettings,
  onGoJoinRequests,
}: ClubTabViewProps) {
  if (isError) {
    return (
      <ScreenLayout>
        <View style={styles.noClubWrapper}>
          <TextBox variant="heading2" color={colors.grey900} style={styles.center}>연결 실패</TextBox>
          <Spacing size={2} />
          <TextBox variant="body2" color={colors.grey500} style={styles.center}>
            잠시 후 다시 시도해주세요
          </TextBox>
        </View>
      </ScreenLayout>
    );
  }

  if (isLoading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingWrapper}>
          <Skeleton width="100%" height={120} borderRadius={16} />
          <Spacing size={3} />
          <Skeleton width="100%" height={80} borderRadius={16} />
          <Spacing size={3} />
          <Skeleton width="100%" height={80} borderRadius={16} />
        </View>
      </ScreenLayout>
    );
  }

  const hasClub = club != null;

  if (!hasClub) {
    return (
      <ScreenLayout>
        <View style={styles.noClubWrapper}>
          <TextBox variant="heading2" color={colors.grey900} style={styles.center}>⚽ 소속 팀이 없어요</TextBox>
          <Spacing size={2} />
          <TextBox variant="body2" color={colors.grey500} style={styles.center}>
            팀을 만들거나 가입 신청을 해보세요
          </TextBox>
          <Spacing size={8} />
          <Button variant="primary" size="large" fullWidth onPress={onCreateClub}>
            팀 만들기
          </Button>
          <Spacing size={2} />
          <Button variant="secondary" size="large" fullWidth onPress={onSearchClub}>
            팀 찾아보기
          </Button>
          <Spacing size={2} />
          <Button variant="ghost" size="medium" fullWidth onPress={onJoinByCode}>
            초대 코드로 가입
          </Button>
        </View>
      </ScreenLayout>
    );
  }

  const isCaptainOrVice = club.myRole === 'CAPTAIN' || club.myRole === 'VICE_CAPTAIN';
  const levelLabel = LEVEL_LABEL[club.level] ?? club.level;

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 클럽 헤더 */}
        <View style={styles.clubHeader}>
          <AvatarImage source={club.logoUrl ? { uri: club.logoUrl } : null} size={64} />
          <View style={styles.clubInfo}>
            <View style={styles.nameRow}>
              <TextBox variant="heading3" color={colors.grey900}>{club.name}</TextBox>
              <RecruitmentBadge status={club.recruitmentStatus} />
            </View>
            <TextBox variant="body2" color={colors.grey500}>
              {club.regionName} · {levelLabel} · {club.currentMemberCount}/{club.maxMemberCount}명
            </TextBox>
            <TextBox variant="caption" color={colors.grey500}>⭐ {club.mannerScoreAvg.toFixed(1)}</TextBox>
          </View>
          <TouchableOpacity onPress={onGoSettings}>
            <TextBox variant="body2" color={colors.grey400}>설정</TextBox>
          </TouchableOpacity>
        </View>

        {club.description ? (
          <>
            <Spacing size={3} />
            <TextBox variant="body2" color={colors.grey700}>{club.description}</TextBox>
          </>
        ) : null}

        <Spacing size={4} />

        {/* 전적 요약 (placeholder — 실제 match 도메인 연동 시 교체) */}
        <ClubStatsBar matchCount={0} winCount={0} drawCount={0} lossCount={0} />

        <Spacing size={4} />

        {/* 빠른 메뉴 */}
        <View style={styles.menuGrid}>
          <MenuButton label="팀원" onPress={onGoMembers} />
          <MenuButton label="게시판" onPress={onGoBoard} />
          {isCaptainOrVice ? (
            <MenuButton label="가입 신청" onPress={onGoJoinRequests} />
          ) : null}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

function MenuButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuBtn} onPress={onPress} activeOpacity={0.7}>
      <TextBox variant="body2Bold" color={colors.grey900}>{label}</TextBox>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loadingWrapper: {
    padding: spacing[4],
  },
  noClubWrapper: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing[6],
  },
  center: {
    textAlign: 'center',
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  clubInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  menuBtn: {
    flex: 1,
    minWidth: '40%',
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
