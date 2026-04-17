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
    title: 'Head-to-Head 기능 테스트',
    accounts: [
      {
        label: '마무리FC 주장 — H2H 진입 (7승 2무 3패)',
        description: '피드 상세 → 상대 전적 보기 → 마무리FC vs 카동FC 12경기 이력 (무한스크롤 확인)',
        email: 'captain@mamurifc.test',
      },
      {
        label: '마무리FC 일반 멤버 — H2H 진입',
        description: '멤버도 H2H 진입 가능 확인 (H2H-01-006)',
        email: 'member1@mamurifc.test',
      },
      {
        label: '카동FC 주장 — 역방향 H2H',
        description: '카동FC 기준 마무리FC 전적 (승/패 반전 확인)',
        email: 'captain@kadongfc.test',
      },
      {
        label: '부산FC 주장 — H2H 빈 상태',
        description: '부산FC vs 마무리FC → 이력 없음, "아직 맞붙은 적이 없습니다." 확인',
        email: 'captain@busanfc.test',
      },
      {
        label: '클럽 미소속 유저 — 403 차단',
        description: 'H2H API 직접 호출 시 403 H2H_001 응답 확인',
        email: 'newbie@test.com',
      },
    ],
  },
  {
    title: 'Match Feed 기능 테스트',
    accounts: [
      {
        label: '마무리FC 주장 (서울 종로구)',
        description: '전체 피드 확인 · "내 클럽만" ON → 마무리FC 10경기만 노출 (MFEED-04-014)',
        email: 'captain@mamurifc.test',
      },
      {
        label: '마무리FC 일반 멤버 (참가 경기 있음)',
        description: '"내가 뛴 경기" ON → M_L1·M_L2·M_S1·기존 recorded 경기 노출 (MFEED-04-014)',
        email: 'member1@mamurifc.test',
      },
      {
        label: '카동FC 주장 (서울 강남구)',
        description: '"내 클럽만" ON → 카동FC 5경기만 노출 / 서울 강남구 지역 필터 테스트',
        email: 'captain@kadongfc.test',
      },
      {
        label: '부산FC 주장 (부산 해운대구)',
        description: '지역 필터 부산광역시/해운대구 → 부산FC 5경기만 노출 (MFEED-04-013)',
        email: 'captain@busanfc.test',
      },
      {
        label: '클럽 미소속 유저',
        description: '"내 클럽만" 토글 탭 → 비활성 유지 + 안내 문구 확인 (MFEED-01-001)',
        email: 'newbie@test.com',
      },
    ],
  },
  {
    title: 'Mercenary 기능 테스트',
    accounts: [
      {
        label: '마무리FC 주장 (용병 구함 등록자)',
        description: '용병 구함 등록·지원자 수락/거절·CLOSED 자동 전환 확인 (phone=010-1111-2222)',
        email: 'captain@mamurifc.test',
      },
      {
        label: '마무리FC 부주장 (phone 없음)',
        description: 'phone 미설정 → 등록 진입 시 AlertDialog 확인 (MERC-05-003)',
        email: 'vice@mamurifc.test',
      },
      {
        label: '마무리FC 일반 멤버 (권한 없음)',
        description: '일반 멤버 → 용병 구함 등록 버튼 미노출, 지원자 관리 403 확인',
        email: 'member1@mamurifc.test',
      },
      {
        label: '카동FC 주장 (영입 신청자)',
        description: '용병 가능 게시글 영입 신청, 용병 구함 지원 (phone=010-3333-4444)',
        email: 'captain@kadongfc.test',
      },
      {
        label: '용병 가능 등록 유저 (영입 수락/거절)',
        description: '용병 가능 등록 + AVAIL_WITH_RECRUIT에 마무리FC PENDING 영입 신청 존재',
        email: 'player@mercenary.test',
      },
      {
        label: '블랙리스트 유저 (mannerScore=15)',
        description: '용병 구함/가능 등록 시 403 MERCENARY_BLACKLIST 에러 확인',
        email: 'blacklist@mercenary.test',
      },
      {
        label: '클럽 미소속 유저',
        description: '용병 가능 등록 + 용병 구함 게시글 지원하기 확인',
        email: 'newbie@test.com',
      },
    ],
  },
  {
    title: 'Matching 기능 테스트',
    accounts: [
      {
        label: '마무리FC 주장 (등록자)',
        description: '매칭 등록·신청 수락/거절·연락처 확인 (phone=010-1111-2222)',
        email: 'captain@mamurifc.test',
      },
      {
        label: '마무리FC 부주장 (phone 없음)',
        description: 'phone guard AlertDialog 확인 — 등록/신청 진입 시 프로필 이동 유도',
        email: 'vice@mamurifc.test',
      },
      {
        label: '마무리FC 일반 멤버 (권한 없음)',
        description: '일반 멤버는 매칭 등록·신청 버튼 미노출 확인',
        email: 'member1@mamurifc.test',
      },
      {
        label: '카동FC 주장 (신청자)',
        description: '마무리FC 게시글 신청, 내 신청 탭 PENDING 확인 (phone=010-3333-4444)',
        email: 'captain@kadongfc.test',
      },
      {
        label: '한강FC 주장 (3팀 수락 테스트)',
        description: 'POST_MULTI에 PENDING 신청 — 카동 수락 시 자동 REJECTED 확인',
        email: 'captain@hangangfc.test',
      },
      {
        label: '강남FC 주장 (3팀 수락 테스트)',
        description: 'POST_MULTI에 PENDING 신청 — 카동 수락 시 자동 REJECTED 확인',
        email: 'captain@gangnamfc.test',
      },
    ],
  },
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
          seed 실행: seed:club → seed:match → seed:matching → seed:mercenary → seed:match-feed → seed:head-to-head
        </TextBox>
      </ScrollView>
    </SafeAreaView>
  );
}
