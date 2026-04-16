import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useToast, Modal, TextBox, Spacing, Flex, colors, spacing } from '@ui';
import {
  useMercenaryApplications,
  useAcceptMercenaryApplication,
  useRejectMercenaryApplication,
} from '../../data/hooks/useMercenaryApplications';
import { ApplicationListView } from '../view/ApplicationListView';
import type { MercenaryContact } from '../../data/schemas/mercenaryPost.schema';

interface Props {
  postId: string;
}

export function ApplicationListContainer({ postId }: Props) {
  const { data } = useMercenaryApplications(postId);
  const { toast } = useToast();

  const [contactInfo, setContactInfo] = useState<MercenaryContact['contact'] | null>(null);

  const { mutate: accept, isPending: isAccepting } = useAcceptMercenaryApplication();
  const { mutate: reject, isPending: isRejecting } = useRejectMercenaryApplication();

  const handleAccept = (appId: string) => {
    accept(
      { postId, appId },
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

  const handleReject = (appId: string) => {
    reject(
      { postId, appId },
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
      <ApplicationListView
        applications={data.items}
        onAccept={handleAccept}
        onReject={handleReject}
        isLoading={isAccepting || isRejecting}
      />

      {/* 수락 후 연락처 모달 */}
      <Modal isOpen={!!contactInfo} onClose={() => setContactInfo(null)} title="수락 완료">
        {contactInfo && (
          <View style={styles.contactContent}>
            <TextBox variant="body2" color={colors.grey700}>
              용병과 연락하여 경기를 확정하세요.
            </TextBox>
            <Spacing size={4} />
            <View style={styles.contactBox}>
              <TextBox variant="captionBold" color={colors.grey500}>용병</TextBox>
              <Spacing size={1} />
              <TextBox variant="body2Bold" color={colors.grey900}>{contactInfo.applicant.name}</TextBox>
              <TextBox variant="body2" color={colors.grey700}>{contactInfo.applicant.phone}</TextBox>
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
