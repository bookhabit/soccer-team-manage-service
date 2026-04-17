import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing, Flex, BottomCTASingle, Button, Spacing } from '@ui';
import { MercenaryStatusBadge } from '../components/MercenaryStatusBadge';
import type { MercenaryPostDetail } from '../../data/schemas/mercenaryPost.schema';

interface Props {
  post: MercenaryPostDetail;
  onApply: () => void;
  onManageApplications: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isApplying?: boolean;
}

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: '초급',
  AMATEUR: '아마추어',
  SEMI_PRO: '세미프로',
  PRO: '프로',
};

const POSITION_LABEL: Record<string, string> = {
  FW: 'FW 공격수',
  MF: 'MF 미드필더',
  DF: 'DF 수비수',
  GK: 'GK 골키퍼',
};

function formatDateTime(dateStr: string, startTime: string, endTime: string) {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}(${days[d.getDay()]}) ${startTime}~${endTime}`;
}

export function MercenaryPostDetailView({
  post,
  onApply,
  onManageApplications,
  onEdit,
  onDelete,
  isApplying,
}: Props) {
  const canEditPost = !post.isExpired && post.status === 'OPEN';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* 상태 */}
        <MercenaryStatusBadge status={post.status} isExpired={post.isExpired} />
        <Spacing size={3} />

        {/* 팀 정보 */}
        <View style={styles.section}>
          <TextBox variant="heading3" color={colors.grey900}>
            {post.clubName}
          </TextBox>
          <TextBox variant="body2" color={colors.grey500}>
            {LEVEL_LABEL[post.clubLevel] ?? post.clubLevel}
          </TextBox>
        </View>

        {/* 구하는 용병 정보 */}
        <View style={styles.section}>
          <TextBox variant="body2Bold" color={colors.grey700}>
            구하는 용병
          </TextBox>
          <Spacing size={2} />
          <Flex direction="row" gap={spacing[2]}>
            {post.positions.map((p) => (
              <View key={p} style={styles.posChip}>
                <TextBox variant="captionBold" color={colors.primary}>
                  {POSITION_LABEL[p] ?? p}
                </TextBox>
              </View>
            ))}
          </Flex>
          <Spacing size={2} />
          <TextBox variant="body2" color={colors.grey700}>
            {post.acceptedCount} / {post.requiredCount}명 모집
          </TextBox>
        </View>

        {/* 경기 정보 */}
        <View style={styles.section}>
          <TextBox variant="body2Bold" color={colors.grey700}>
            경기 정보
          </TextBox>
          <Spacing size={2} />
          <InfoRow
            label="일시"
            value={formatDateTime(post.matchDate, post.startTime, post.endTime)}
          />
          <InfoRow
            label="장소"
            value={`${post.location}${post.address ? ` (${post.address})` : ''}`}
          />
          <InfoRow label="실력" value={LEVEL_LABEL[post.level] ?? post.level} />
          <InfoRow
            label="참가비"
            value={post.fee === 0 ? '무료' : `${post.fee.toLocaleString()}원`}
          />
          <InfoRow label="지역" value={`${post.regionName} ${post.regionSigungu}`} />
        </View>

        {/* 상세 설명 */}
        {post.description && (
          <View style={styles.section}>
            <TextBox variant="body2Bold" color={colors.grey700}>
              상세 설명
            </TextBox>
            <Spacing size={2} />
            <TextBox variant="body2" color={colors.grey600}>
              {post.description}
            </TextBox>
          </View>
        )}

        {/* 관리자 액션 */}
        {post.isOwnPost && (
          <View style={styles.section}>
            <Flex direction="row" gap={spacing[2]}>
              {canEditPost && (
                <Button variant="secondary" size="small" onPress={onEdit} style={styles.actionBtn}>
                  수정
                </Button>
              )}
              <Button variant="danger" size="small" onPress={onDelete} style={styles.actionBtn}>
                삭제
              </Button>
            </Flex>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      {post.isOwnPost ? (
        <BottomCTASingle safeArea label="지원자 관리">
          <Button variant="primary" onPress={onManageApplications} fullWidth>
            지원자 관리
          </Button>
        </BottomCTASingle>
      ) : (
        <BottomCTASingle safeArea>
          <Button
            variant="primary"
            onPress={onApply}
            disabled={!post.canApply || isApplying}
            fullWidth
          >
            {post.alreadyApplied
              ? '지원 완료'
              : post.isExpired
                ? '만료된 게시글'
                : post.status === 'CLOSED'
                  ? '마감된 게시글'
                  : '지원하기'}
          </Button>
        </BottomCTASingle>
      )}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex direction="row" style={styles.infoRow}>
      <TextBox variant="body2" color={colors.grey500} style={styles.infoLabel}>
        {label}
      </TextBox>
      <TextBox variant="body2" color={colors.grey900} style={styles.infoValue}>
        {value}
      </TextBox>
    </Flex>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing[4], paddingBottom: spacing[24] },
  section: {
    marginBottom: spacing[5],
    paddingBottom: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  posChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.blue50,
  },
  infoRow: { marginBottom: spacing[2] },
  infoLabel: { width: 60, flexShrink: 0 },
  infoValue: { flex: 1 },
  actionBtn: { flex: 1 },
});
