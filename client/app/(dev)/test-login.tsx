import React, { useState } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, TextBox, Flex, Spacing, colors, spacing } from '@ui';
import { apiClient } from '@/src/shared/http/apiClient';
import { useAuthStore } from '@/src/shared/store/useAuthStore';

// ─── 계정 목록 ────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    title: 'Match 기능 테스트',
    accounts: [
      {
        label: '마무리FC 주장',
        description: '경기 생성·라인업·기록 입력 등 관리자 기능 전체 검증',
        email: 'captain@mamurifc.test',
      },
      {
        label: '마무리FC 부주장',
        description: '부주장 권한 (관리자 기능 동일하게 접근 가능)',
        email: 'vice@mamurifc.test',
      },
      {
        label: '마무리FC 일반 멤버',
        description: '투표·MOM 투표 등 멤버 기능, 관리자 버튼 비노출 확인',
        email: 'member1@mamurifc.test',
      },
      {
        label: '카동FC 주장',
        description: '별도 클럽 경기 목록 독립성 확인',
        email: 'captain@kadongfc.test',
      },
      {
        label: '클럽 미소속 유저',
        description: '클럽 미소속 시 경기 탭 접근 차단 확인',
        email: 'newbie@test.com',
      },
    ],
  },
  {
    title: 'Club 기능 테스트',
    accounts: [
      {
        label: '마무리FC 주장',
        description: '관리자 권한 전체 (강퇴·승인·설정)',
        email: 'captain@mamurifc.test',
      },
      {
        label: '마무리FC 부주장',
        description: '부주장 권한 (강퇴·승인 가능)',
        email: 'vice@mamurifc.test',
      },
      {
        label: '마무리FC 일반 멤버',
        description: '멤버 권한 (관리자 기능 차단 확인)',
        email: 'member1@mamurifc.test',
      },
      {
        label: '카동FC 주장',
        description: '별도 클럽 (지역 검색·추천 확인)',
        email: 'captain@kadongfc.test',
      },
      {
        label: '클럽 미소속 유저',
        description: '클럽 생성·검색·초대 코드 입력',
        email: 'newbie@test.com',
      },
      {
        label: '가입 신청 대기 중 유저',
        description: '신청 취소 버튼 노출 확인',
        email: 'pending@test.com',
      },
      {
        label: '강퇴 이력 유저',
        description: '마무리FC 재가입 시 CLUB_005 에러',
        email: 'banned@test.com',
      },
    ],
  },
] as const;

const PASSWORD = 'test1234!';

// ─── Component ────────────────────────────────────────────────────────────────

export default function TestLoginScreen() {
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const setTokens = useAuthStore((s) => s.setTokens);

  const handleLogin = async (email: string) => {
    setLoadingEmail(email);
    setErrorMsg(null);

    try {
      const res = await apiClient.publicApi.post<{ accessToken: string; refreshToken: string }>(
        '/sessions',
        { email, password: PASSWORD },
      );
      setTokens(res.data.accessToken, res.data.refreshToken);
      router.replace('/(app)');
    } catch {
      setErrorMsg(`로그인 실패: ${email}\n서버가 실행 중인지, seed 데이터가 있는지 확인하세요.`);
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing[4], paddingBottom: spacing[10], gap: spacing[4] }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 헤더 */}
        <Spacing size={spacing[2]} />
        <TextBox variant="heading2" color={colors.grey900}>
          테스트 로그인
        </TextBox>
        <TextBox variant="caption" color={colors.grey500}>
          개발 환경 전용 · 비밀번호: {PASSWORD}
        </TextBox>
        <Spacing size={spacing[4]} />

        {/* 에러 메시지 */}
        {errorMsg && (
          <>
            <TextBox variant="body2" color={colors.error}>
              {errorMsg}
            </TextBox>
            <Spacing size={spacing[3]} />
          </>
        )}

        {/* 섹션별 계정 버튼 */}
        {SECTIONS.map((section) => (
          <React.Fragment key={section.title}>
            {/* 섹션 헤더 */}
            <Flex direction="row" align="center" style={{ marginBottom: spacing[2] }}>
              <TextBox variant="body2Bold" color={colors.primary}>
                {section.title}
              </TextBox>
            </Flex>

            {section.accounts.map((account) => {
              const isLoading = loadingEmail === account.email;
              return (
                <React.Fragment key={account.email}>
                  <Button
                    variant="primary"
                    onPress={() => handleLogin(account.email)}
                    disabled={loadingEmail !== null}
                    size="large"
                  >
                    <Flex direction="column" align="flex-start" style={{ flex: 1 }}>
                      <Flex
                        direction="row"
                        align="center"
                        justify="space-between"
                        style={{ width: '100%' }}
                      >
                        <TextBox variant="body2Bold" color={colors.grey900}>
                          {account.label}
                        </TextBox>
                        {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
                      </Flex>
                      <TextBox variant="caption" color={colors.grey500}>
                        {account.description}
                      </TextBox>
                      <TextBox variant="caption" color={colors.grey400}>
                        {account.email}
                      </TextBox>
                    </Flex>
                  </Button>
                </React.Fragment>
              );
            })}

            <Spacing size={spacing[4]} />
          </React.Fragment>
        ))}

        {/* 안내 */}
        <TextBox variant="caption" color={colors.grey400} style={{ textAlign: 'center' }}>
          seed 실행: cd server {'&&'} npm run seed:club {'&&'} npm run seed:match
        </TextBox>
      </ScrollView>
    </SafeAreaView>
  );
}
