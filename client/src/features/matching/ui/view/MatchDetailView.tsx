import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  TextBox,
  AvatarImage,
  Button,
  BottomCTASingle,
  BottomCTADouble,
  ScreenLayout,
  Spacing,
  colors,
  spacing,
} from '@ui';
import { LEVEL_LABEL } from '@/src/shared/constants/player.constants';
import type { MatchPostDetail } from '../../data/schemas/matchPost.schema';
import type { MatchContact } from '../../data/schemas/matchPost.schema';
import { MatchStatusBadge } from '../components/MatchStatusBadge';
import { ContactCard } from '../components/ContactCard';

const GENDER_LABEL: Record<string, string> = {
  MALE: '남성',
  FEMALE: '여성',
  MIXED: '혼성',
};

interface MatchDetailViewProps {
  post: MatchPostDetail;
  contact: MatchContact | undefined;
  onApply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onViewApplications: () => void;
  isDeleting: boolean;
  isCancelling: boolean;
}

/**
 * 매칭 게시글 상세 뷰.
 */
export function MatchDetailView({
  post,
  contact,
  onApply,
  onEdit,
  onDelete,
  onCancel,
  onViewApplications,
  isDeleting,
  isCancelling,
}: MatchDetailViewProps) {
  const dateLabel = new Date(post.matchDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
  const feeLabel = post.fee === 0 ? '무료' : `${post.fee.toLocaleString()}원`;

  const bottomSlot = post.isOwnPost ? (
    <BottomCTADouble
      primaryLabel="신청 목록"
      secondaryLabel="수정"
      onPrimary={onViewApplications}
      onSecondary={onEdit}
    />
  ) : post.canApply ? (
    <BottomCTASingle label="매칭 신청" onClick={onApply} safeArea />
  ) : null;

  return (
    <ScreenLayout bottomSlot={bottomSlot}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 클럽 헤더 */}
        <View style={styles.clubHeader}>
          <AvatarImage
            source={post.clubLogoUrl ? { uri: post.clubLogoUrl } : undefined}
            size={48}
          />
          <View style={styles.clubInfo}>
            <TextBox variant="body1Bold" color={colors.grey900}>
              {post.clubName}
            </TextBox>
            <TextBox variant="caption" color={colors.grey500}>
              {LEVEL_LABEL[post.clubLevel] ?? post.clubLevel}
            </TextBox>
          </View>
          <MatchStatusBadge status={post.status} isExpired={post.isExpired} />
        </View>

        <View style={styles.divider} />

        {/* 경기 정보 */}
        <Section title="경기 일정">
          <InfoRow label="날짜" value={dateLabel} />
          <InfoRow label="시간" value={`${post.startTime} – ${post.endTime}`} />
        </Section>

        <Section title="장소">
          <InfoRow label="구장" value={post.location} />
          {post.address && <InfoRow label="주소" value={post.address} />}
          <InfoRow label="지역" value={`${post.regionName} ${post.regionSigungu}`} />
        </Section>

        <Section title="경기 조건">
          <InfoRow label="인원" value={`${post.playerCount}명`} />
          <InfoRow label="성별" value={GENDER_LABEL[post.gender] ?? post.gender} />
          <InfoRow label="레벨" value={LEVEL_LABEL[post.level] ?? post.level} />
          <InfoRow label="구장비" value={feeLabel} />
        </Section>

        {/* 연락처 (수락 후 공개) */}
        {contact && (
          <Section title="연락처">
            <ContactCard contactName={contact.contactName} contactPhone={contact.contactPhone} />
          </Section>
        )}

        {/* 등록자 본인: 매칭 취소 + 삭제 버튼 */}
        {post.isOwnPost && (
          <>
            <Spacing size={4} />
            {post.status === 'MATCHED' && (
              <>
                <Button
                  variant="danger"
                  size="medium"
                  onPress={onCancel}
                  loading={isCancelling}
                >
                  매칭 취소
                </Button>
                <Spacing size={2} />
              </>
            )}
            <Button
              variant="danger"
              size="medium"
              onPress={onDelete}
              loading={isDeleting}
              disabled={post.status === 'MATCHED'}
            >
              게시글 삭제
            </Button>
          </>
        )}

        <Spacing size={20} />
      </ScrollView>
    </ScreenLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <TextBox variant="body2Bold" color={colors.grey500} style={styles.sectionTitle}>
        {title}
      </TextBox>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <TextBox variant="body2" color={colors.grey500} style={styles.infoLabel}>
        {label}
      </TextBox>
      <TextBox variant="body2" color={colors.grey900} style={styles.infoValue}>
        {value}
      </TextBox>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[5],
    paddingBottom: spacing[20],
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  clubInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  divider: {
    height: 1,
    backgroundColor: colors.grey100,
    marginBottom: spacing[4],
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    marginBottom: spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey50,
  },
  infoLabel: {
    width: 60,
  },
  infoValue: {
    flex: 1,
  },
});
