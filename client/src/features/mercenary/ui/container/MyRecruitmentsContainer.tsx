import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useToast, Modal, TextBox, Spacing, colors, spacing } from '@ui';
import {
  useMyRecruitments,
  useAcceptMercenaryRecruitment,
  useRejectMercenaryRecruitment,
} from '../../data/hooks/useMercenaryAvailabilities';
import { MyRecruitmentsView } from '../view/MyRecruitmentsView';
import type { MercenaryRecruitContact } from '../../data/schemas/mercenaryAvailability.schema';

export function MyRecruitmentsContainer() {
  const { data } = useMyRecruitments();
  const { toast } = useToast();

  const [contactInfo, setContactInfo] = useState<MercenaryRecruitContact['contact'] | null>(null);

  const { mutate: accept, isPending: isAccepting } = useAcceptMercenaryRecruitment();
  const { mutate: reject, isPending: isRejecting } = useRejectMercenaryRecruitment();

  const handleAccept = (availId: string, recId: string) => {
    accept(
      { availId, recId },
      {
        onSuccess: (data) => {
          setContactInfo(data.contact);
        },
        onError: (err: any) => {
          const code = err?.response?.data?.code;
          if (code === 'MERCENARY_APP_002') {
            toast.error('이미 처리된 신청입니다.');
          } else {
            toast.error('수락에 실패했습니다.');
          }
        },
      },
    );
  };

  const handleReject = (availId: string, recId: string) => {
    reject(
      { availId, recId },
      {
        onSuccess: () => {
          toast.success('거절되었습니다.');
        },
        onError: () => {
          toast.error('거절에 실패했습니다.');
        },
      },
    );
  };

  return (
    <>
      <MyRecruitmentsView
        recruitments={data.items}
        onAccept={handleAccept}
        onReject={handleReject}
        isLoading={isAccepting || isRejecting}
      />

      {/* 수락 후 연락처 모달 */}
      <Modal isOpen={!!contactInfo} onClose={() => setContactInfo(null)} title="영입 신청 수락 완료">
        {contactInfo && (
          <View style={styles.contactContent}>
            <TextBox variant="body2" color={colors.grey700}>
              팀과 연락하여 경기 일정을 확인하세요.
            </TextBox>
            <Spacing size={4} />
            <View style={styles.contactBox}>
              <TextBox variant="captionBold" color={colors.grey500}>팀 담당자</TextBox>
              <Spacing size={1} />
              <TextBox variant="body2Bold" color={colors.grey900}>{contactInfo.club.name}</TextBox>
              <TextBox variant="body2" color={colors.grey700}>{contactInfo.club.phone}</TextBox>
            </View>
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  contactContent: { padding: spacing[4] },
  contactBox: {
    padding: spacing[4],
    backgroundColor: colors.grey50,
    borderRadius: 8,
  },
});
