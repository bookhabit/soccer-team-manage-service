import {
  PrismaClient,
  MatchType,
  ClubLevel,
  ClubRole,
  Gender,
  PlayerPosition,
  PlayerFoot,
  PlayerLevel,
  RecruitmentStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── 테스트 계정 정의 (테스트 로그인 페이지에서 사용) ─────────────────────
export const TEST_ACCOUNTS = [
  {
    label: '마무리FC 주장 (서울 종로구)',
    description: '내 클럽 필터 → 마무리FC 경기만 노출 확인, 내가 뛴 경기 필터도 테스트',
    email: 'captain@mamurifc.test',
    password: 'test1234!',
  },
  {
    label: '마무리FC 일반 멤버 (참가 경기 있음)',
    description: '내가 뛴 경기 필터 → 참가한 경기만 노출 확인 (MFEED-04-014)',
    email: 'member1@mamurifc.test',
    password: 'test1234!',
  },
  {
    label: '카동FC 주장 (서울 강남구)',
    description: '내 클럽 필터 → 카동FC 경기만 노출, 서울 강남구 지역 필터 테스트',
    email: 'captain@kadongfc.test',
    password: 'test1234!',
  },
  {
    label: '부산FC 주장 (부산 해운대구)',
    description: '지역 필터 부산광역시 / 해운대구 테스트 (MFEED-04-013)',
    email: 'captain@busanfc.test',
    password: 'test1234!',
  },
  {
    label: '클럽 미소속 유저',
    description: '"내 클럽만" 토글 비활성 + 안내 문구 확인 (MFEED-01-001)',
    email: 'newbie@test.com',
    password: 'test1234!',
  },
] as const;

// ─── 고정 ID ──────────────────────────────────────────────────────────────────

// 기존 club.seed.ts 에서 생성된 유저/클럽 ID (중복 생성 안 함)
const USER = {
  MAMURI_CAPTAIN: 'seed-user-mamuri-captain',
  MAMURI_VICE: 'seed-user-mamuri-vice',
  MAMURI_MEMBER1: 'seed-user-mamuri-member1',
  MAMURI_MEMBER2: 'seed-user-mamuri-member2',
  MAMURI_MEMBER3: 'seed-user-mamuri-member3',
  KADONG_CAPTAIN: 'seed-user-kadong-captain',
  KADONG_MEMBER: 'seed-user-kadong-member',
  // match-feed 전용 신규 유저
  BUSAN_CAPTAIN: 'seed-mfeed-user-busan-captain',
  BUSAN_MEMBER1: 'seed-mfeed-user-busan-member1',
  BUSAN_MEMBER2: 'seed-mfeed-user-busan-member2',
};

const CLUB = {
  MAMURI: 'seed-club-mamuri',
  KADONG: 'seed-club-kadong',
  BUSAN: 'seed-mfeed-club-busan', // match-feed 전용 신규 클럽
};

// match.seed.ts 에서 이미 생성된 기록 완료 경기 (피드에 자동 노출됨)
// - seed-match-after-league-recorded : 마무리FC vs 한강FC  3:1
// - seed-match-after-mom-active      : 마무리FC vs 한강FC  2:2

const MATCH = {
  // 마무리FC 추가 완료 경기 (페이지네이션 + 필터 테스트용)
  M_L1: 'seed-mfeed-m-league-1',
  M_L2: 'seed-mfeed-m-league-2',
  M_L3: 'seed-mfeed-m-league-3',
  M_L4: 'seed-mfeed-m-league-4',
  M_L5: 'seed-mfeed-m-league-5',
  M_S1: 'seed-mfeed-m-self-1',
  M_S2: 'seed-mfeed-m-self-2',
  M_S3: 'seed-mfeed-m-self-3',
  // 카동FC 완료 경기
  K_L1: 'seed-mfeed-k-league-1',
  K_L2: 'seed-mfeed-k-league-2',
  K_L3: 'seed-mfeed-k-league-3',
  K_S1: 'seed-mfeed-k-self-1',
  K_S2: 'seed-mfeed-k-self-2',
  // 부산FC 완료 경기 (지역 필터 테스트)
  B_L1: 'seed-mfeed-b-league-1',
  B_L2: 'seed-mfeed-b-league-2',
  B_L3: 'seed-mfeed-b-league-3',
  B_S1: 'seed-mfeed-b-self-1',
  B_S2: 'seed-mfeed-b-self-2',
  // 피드 노출 제외 케이스 검증용
  M_DELETED: 'seed-mfeed-m-deleted',         // isDeleted=true → 피드 노출 안됨
  M_NOT_SUBMITTED: 'seed-mfeed-m-not-submitted', // isRecordSubmitted=false → 피드 노출 안됨
};

// ─── 날짜 헬퍼 (기준: 2026-04-17) ─────────────────────────────────────────────
const BASE = new Date('2026-04-17T00:00:00+09:00');

function daysAgo(days: number, hour = 17): Date {
  const d = new Date(BASE);
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

// ─── Step 1. 부산FC 신규 유저/클럽 생성 ─────────────────────────────────────

async function seedBusanClub(passwordHash: string) {
  console.log('🌊 부산FC 유저/클럽 시딩...');

  // 부산광역시 해운대구 지역 조회
  const regionBusan = await prisma.region.findFirst({
    where: { name: '부산광역시', sigungu: '해운대구' },
  });
  if (!regionBusan) throw new Error('부산광역시 해운대구 지역 없음. db:seed 먼저 실행하세요.');

  // 부산FC 유저
  const users = [
    {
      id: USER.BUSAN_CAPTAIN,
      email: 'captain@busanfc.test',
      passwordHash,
      name: '강부산',
      birthYear: 1991,
      gender: Gender.MALE,
      position: PlayerPosition.FW,
      foot: PlayerFoot.RIGHT,
      years: 8,
      level: PlayerLevel.AMATEUR,
      isOnboarded: true,
    },
    {
      id: USER.BUSAN_MEMBER1,
      email: 'member1@busanfc.test',
      passwordHash,
      name: '해운대선수1',
      birthYear: 1996,
      gender: Gender.MALE,
      position: PlayerPosition.MF,
      foot: PlayerFoot.RIGHT,
      years: 4,
      level: PlayerLevel.AMATEUR,
      isOnboarded: true,
    },
    {
      id: USER.BUSAN_MEMBER2,
      email: 'member2@busanfc.test',
      passwordHash,
      name: '해운대선수2',
      birthYear: 1998,
      gender: Gender.MALE,
      position: PlayerPosition.DF,
      foot: PlayerFoot.LEFT,
      years: 2,
      level: PlayerLevel.BEGINNER,
      isOnboarded: true,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({ where: { id: u.id }, update: {}, create: u });
  }

  // 부산FC 클럽
  await prisma.club.upsert({
    where: { id: CLUB.BUSAN },
    update: {},
    create: {
      id: CLUB.BUSAN,
      name: '부산FC',
      regionId: regionBusan.id,
      level: ClubLevel.AMATEUR,
      maxMemberCount: 20,
      currentMemberCount: 3,
      recruitmentStatus: RecruitmentStatus.OPEN,
    },
  });

  // 멤버십
  const memberships = [
    { clubId: CLUB.BUSAN, userId: USER.BUSAN_CAPTAIN, role: ClubRole.CAPTAIN },
    { clubId: CLUB.BUSAN, userId: USER.BUSAN_MEMBER1, role: ClubRole.MEMBER },
    { clubId: CLUB.BUSAN, userId: USER.BUSAN_MEMBER2, role: ClubRole.MEMBER },
  ];

  for (const m of memberships) {
    await prisma.clubMember.upsert({
      where: { clubId_userId: { clubId: m.clubId, userId: m.userId } },
      update: {},
      create: m,
    });
  }

  console.log('  ✅ 부산FC 생성 완료 (유저 3명)');
}

// ─── Step 2. 피드 노출 경기 생성 ──────────────────────────────────────────────

async function seedFeedMatches() {
  console.log('⚽ 피드 경기 시딩...');

  // 마무리FC 기본 정보 (종로구 소재)
  const mamuriBase = {
    clubId: CLUB.MAMURI,
    location: '광화문 인조잔디구장',
    address: '서울특별시 종로구 세종대로 172',
    isDeleted: false,
    isRecordSubmitted: true,
  };

  // 카동FC 기본 정보 (강남구 소재)
  const kadongBase = {
    clubId: CLUB.KADONG,
    location: '강남 풋살파크',
    address: '서울특별시 강남구 언주로 409',
    isDeleted: false,
    isRecordSubmitted: true,
  };

  // 부산FC 기본 정보 (해운대구 소재)
  const busanBase = {
    clubId: CLUB.BUSAN,
    location: '해운대 풋살장',
    address: '부산광역시 해운대구 해운대해변로 264',
    isDeleted: false,
    isRecordSubmitted: true,
  };

  const now = new Date(BASE);

  const matches = [
    // ── 마무리FC LEAGUE 경기 (5개) ──────────────────────────────────────────
    {
      id: MATCH.M_L1,
      ...mamuriBase,
      type: MatchType.LEAGUE,
      title: '마무리FC vs 은평FC 친선전',
      opponentName: '은평FC',
      opponentLevel: ClubLevel.AMATEUR,
      startAt: daysAgo(10),
      endAt: daysAgo(10, 19),
      voteDeadline: daysAgo(11, 20),
      homeScore: 2,
      awayScore: 1,
      recordedBy: USER.MAMURI_CAPTAIN,
      recordedAt: daysAgo(10, 20),
    },
    {
      id: MATCH.M_L2,
      ...mamuriBase,
      type: MatchType.LEAGUE,
      title: '마무리FC vs 성수FC 정기전',
      opponentName: '성수FC',
      opponentLevel: ClubLevel.SEMI_PRO,
      startAt: daysAgo(20),
      endAt: daysAgo(20, 19),
      voteDeadline: daysAgo(21, 20),
      homeScore: 1,
      awayScore: 1,
      recordedBy: USER.MAMURI_CAPTAIN,
      recordedAt: daysAgo(20, 20),
    },
    {
      id: MATCH.M_L3,
      ...mamuriBase,
      type: MatchType.LEAGUE,
      title: '마무리FC vs 망원FC 컵대회',
      opponentName: '망원FC',
      opponentLevel: ClubLevel.AMATEUR,
      startAt: daysAgo(30),
      endAt: daysAgo(30, 19),
      voteDeadline: daysAgo(31, 20),
      homeScore: 3,
      awayScore: 2,
      recordedBy: USER.MAMURI_CAPTAIN,
      recordedAt: daysAgo(30, 20),
    },
    {
      id: MATCH.M_L4,
      ...mamuriBase,
      type: MatchType.LEAGUE,
      title: '마무리FC vs 혜화FC',
      opponentName: '혜화FC',
      opponentLevel: ClubLevel.BEGINNER,
      startAt: daysAgo(45),
      endAt: daysAgo(45, 19),
      voteDeadline: daysAgo(46, 20),
      homeScore: 5,
      awayScore: 0,
      recordedBy: USER.MAMURI_CAPTAIN,
      recordedAt: daysAgo(45, 20),
    },
    {
      id: MATCH.M_L5,
      ...mamuriBase,
      type: MatchType.LEAGUE,
      title: '마무리FC vs 동작FC',
      opponentName: '동작FC',
      opponentLevel: ClubLevel.AMATEUR,
      startAt: daysAgo(60),
      endAt: daysAgo(60, 19),
      voteDeadline: daysAgo(61, 20),
      homeScore: 0,
      awayScore: 2,
      recordedBy: USER.MAMURI_CAPTAIN,
      recordedAt: daysAgo(60, 20),
    },

    // ── 마무리FC SELF 경기 (3개) ─────────────────────────────────────────────
    {
      id: MATCH.M_S1,
      ...mamuriBase,
      type: MatchType.SELF,
      title: '마무리FC 자체전 A vs B',
      opponentName: null,
      startAt: daysAgo(5),
      endAt: daysAgo(5, 12),
      voteDeadline: daysAgo(6, 20),
      homeScore: 4,
      awayScore: 3,
      recordedBy: USER.MAMURI_CAPTAIN,
      recordedAt: daysAgo(5, 13),
    },
    {
      id: MATCH.M_S2,
      ...mamuriBase,
      type: MatchType.SELF,
      title: '마무리FC 훈련 내부전',
      opponentName: null,
      startAt: daysAgo(25),
      endAt: daysAgo(25, 12),
      voteDeadline: daysAgo(26, 20),
      homeScore: 2,
      awayScore: 2,
      recordedBy: USER.MAMURI_VICE,
      recordedAt: daysAgo(25, 13),
    },
    {
      id: MATCH.M_S3,
      ...mamuriBase,
      type: MatchType.SELF,
      title: '마무리FC 봄 자체전',
      opponentName: null,
      startAt: daysAgo(50),
      endAt: daysAgo(50, 12),
      voteDeadline: daysAgo(51, 20),
      homeScore: 3,
      awayScore: 1,
      recordedBy: USER.MAMURI_VICE,
      recordedAt: daysAgo(50, 13),
    },

    // ── 카동FC LEAGUE 경기 (3개) ─────────────────────────────────────────────
    {
      id: MATCH.K_L1,
      ...kadongBase,
      type: MatchType.LEAGUE,
      title: '카동FC vs 마무리FC 정기전',
      opponentName: '마무리FC',
      opponentLevel: ClubLevel.SEMI_PRO,
      startAt: daysAgo(8),
      endAt: daysAgo(8, 19),
      voteDeadline: daysAgo(9, 20),
      homeScore: 1,
      awayScore: 2,
      recordedBy: USER.KADONG_CAPTAIN,
      recordedAt: daysAgo(8, 20),
    },
    {
      id: MATCH.K_L2,
      ...kadongBase,
      type: MatchType.LEAGUE,
      title: '카동FC vs 역삼FC 컵전',
      opponentName: '역삼FC',
      opponentLevel: ClubLevel.AMATEUR,
      startAt: daysAgo(22),
      endAt: daysAgo(22, 19),
      voteDeadline: daysAgo(23, 20),
      homeScore: 3,
      awayScore: 3,
      recordedBy: USER.KADONG_CAPTAIN,
      recordedAt: daysAgo(22, 20),
    },
    {
      id: MATCH.K_L3,
      ...kadongBase,
      type: MatchType.LEAGUE,
      title: '카동FC vs 압구정FC',
      opponentName: '압구정FC',
      opponentLevel: ClubLevel.SEMI_PRO,
      startAt: daysAgo(40),
      endAt: daysAgo(40, 19),
      voteDeadline: daysAgo(41, 20),
      homeScore: 2,
      awayScore: 0,
      recordedBy: USER.KADONG_CAPTAIN,
      recordedAt: daysAgo(40, 20),
    },

    // ── 카동FC SELF 경기 (2개) ───────────────────────────────────────────────
    {
      id: MATCH.K_S1,
      ...kadongBase,
      type: MatchType.SELF,
      title: '카동FC 주중 자체전',
      opponentName: null,
      startAt: daysAgo(15),
      endAt: daysAgo(15, 12),
      voteDeadline: daysAgo(16, 20),
      homeScore: 1,
      awayScore: 3,
      recordedBy: USER.KADONG_CAPTAIN,
      recordedAt: daysAgo(15, 13),
    },
    {
      id: MATCH.K_S2,
      ...kadongBase,
      type: MatchType.SELF,
      title: '카동FC 전술 훈련전',
      opponentName: null,
      startAt: daysAgo(55),
      endAt: daysAgo(55, 12),
      voteDeadline: daysAgo(56, 20),
      homeScore: 2,
      awayScore: 2,
      recordedBy: USER.KADONG_CAPTAIN,
      recordedAt: daysAgo(55, 13),
    },

    // ── 부산FC LEAGUE 경기 (3개) — 지역 필터 테스트 핵심 ────────────────────
    {
      id: MATCH.B_L1,
      ...busanBase,
      type: MatchType.LEAGUE,
      title: '부산FC vs 수영FC 친선전',
      opponentName: '수영FC',
      opponentLevel: ClubLevel.AMATEUR,
      startAt: daysAgo(6),
      endAt: daysAgo(6, 19),
      voteDeadline: daysAgo(7, 20),
      homeScore: 4,
      awayScore: 1,
      recordedBy: USER.BUSAN_CAPTAIN,
      recordedAt: daysAgo(6, 20),
    },
    {
      id: MATCH.B_L2,
      ...busanBase,
      type: MatchType.LEAGUE,
      title: '부산FC vs 센텀FC 리그전',
      opponentName: '센텀FC',
      opponentLevel: ClubLevel.SEMI_PRO,
      startAt: daysAgo(18),
      endAt: daysAgo(18, 19),
      voteDeadline: daysAgo(19, 20),
      homeScore: 0,
      awayScore: 1,
      recordedBy: USER.BUSAN_CAPTAIN,
      recordedAt: daysAgo(18, 20),
    },
    {
      id: MATCH.B_L3,
      ...busanBase,
      type: MatchType.LEAGUE,
      title: '부산FC vs 동래FC',
      opponentName: '동래FC',
      opponentLevel: ClubLevel.AMATEUR,
      startAt: daysAgo(35),
      endAt: daysAgo(35, 19),
      voteDeadline: daysAgo(36, 20),
      homeScore: 2,
      awayScore: 2,
      recordedBy: USER.BUSAN_CAPTAIN,
      recordedAt: daysAgo(35, 20),
    },

    // ── 부산FC SELF 경기 (2개) ───────────────────────────────────────────────
    {
      id: MATCH.B_S1,
      ...busanBase,
      type: MatchType.SELF,
      title: '부산FC 자체 훈련전',
      opponentName: null,
      startAt: daysAgo(12),
      endAt: daysAgo(12, 12),
      voteDeadline: daysAgo(13, 20),
      homeScore: 3,
      awayScore: 2,
      recordedBy: USER.BUSAN_CAPTAIN,
      recordedAt: daysAgo(12, 13),
    },
    {
      id: MATCH.B_S2,
      ...busanBase,
      type: MatchType.SELF,
      title: '부산FC 전반기 훈련',
      opponentName: null,
      startAt: daysAgo(42),
      endAt: daysAgo(42, 12),
      voteDeadline: daysAgo(43, 20),
      homeScore: 1,
      awayScore: 4,
      recordedBy: USER.BUSAN_MEMBER1,
      recordedAt: daysAgo(42, 13),
    },

    // ── 피드 제외 케이스 (isDeleted=true / isRecordSubmitted=false) ───────────
    {
      id: MATCH.M_DELETED,
      ...mamuriBase,
      type: MatchType.LEAGUE,
      title: '삭제된 경기 (피드 노출 안됨)',
      opponentName: '삭제팀',
      opponentLevel: ClubLevel.AMATEUR,
      startAt: daysAgo(3),
      endAt: daysAgo(3, 19),
      voteDeadline: daysAgo(4, 20),
      homeScore: 1,
      awayScore: 0,
      isDeleted: true,      // ← 피드 제외
      recordedBy: USER.MAMURI_CAPTAIN,
      recordedAt: daysAgo(3, 20),
    },
    {
      id: MATCH.M_NOT_SUBMITTED,
      ...mamuriBase,
      type: MatchType.LEAGUE,
      title: '기록 미제출 경기 (피드 노출 안됨)',
      opponentName: '미제출팀',
      opponentLevel: ClubLevel.AMATEUR,
      startAt: daysAgo(2),
      endAt: daysAgo(2, 19),
      voteDeadline: daysAgo(3, 20),
      homeScore: null,
      awayScore: null,
      isRecordSubmitted: false, // ← 피드 제외
    },
  ];

  for (const match of matches) {
    await prisma.match.upsert({
      where: { id: match.id },
      update: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: match as any,
    });
  }

  console.log(`  ✅ 피드 경기 ${matches.length}개 완료 (피드 노출 ${matches.length - 2}개)`);
}

// ─── Step 3. 득점 기록 시딩 ───────────────────────────────────────────────────

async function seedGoals() {
  console.log('⚽ 골 기록 시딩...');

  type GoalData = {
    matchId: string;
    scorerUserId: string;
    assistUserId: string | null;
    quarterNumber: number;
    team: string | null;
  };

  const goals: GoalData[] = [
    // 마무리FC vs 은평FC (2:1)
    { matchId: MATCH.M_L1, scorerUserId: USER.MAMURI_CAPTAIN, assistUserId: USER.MAMURI_MEMBER1, quarterNumber: 1, team: null },
    { matchId: MATCH.M_L1, scorerUserId: USER.MAMURI_MEMBER1, assistUserId: null, quarterNumber: 2, team: null },
    // 부산FC vs 수영FC (4:1) — 지역 필터 테스트용 상세 확인
    { matchId: MATCH.B_L1, scorerUserId: USER.BUSAN_CAPTAIN, assistUserId: USER.BUSAN_MEMBER1, quarterNumber: 1, team: null },
    { matchId: MATCH.B_L1, scorerUserId: USER.BUSAN_MEMBER1, assistUserId: null, quarterNumber: 1, team: null },
    { matchId: MATCH.B_L1, scorerUserId: USER.BUSAN_CAPTAIN, assistUserId: null, quarterNumber: 2, team: null },
    { matchId: MATCH.B_L1, scorerUserId: USER.BUSAN_MEMBER2, assistUserId: USER.BUSAN_CAPTAIN, quarterNumber: 2, team: null },
    // 마무리FC 자체전 A vs B (4:3)
    { matchId: MATCH.M_S1, scorerUserId: USER.MAMURI_CAPTAIN, assistUserId: null, quarterNumber: 1, team: 'A' },
    { matchId: MATCH.M_S1, scorerUserId: USER.MAMURI_MEMBER1, assistUserId: USER.MAMURI_VICE, quarterNumber: 1, team: 'A' },
    { matchId: MATCH.M_S1, scorerUserId: USER.MAMURI_VICE, assistUserId: null, quarterNumber: 2, team: 'B' },
    { matchId: MATCH.M_S1, scorerUserId: USER.MAMURI_MEMBER2, assistUserId: null, quarterNumber: 2, team: 'A' },
    { matchId: MATCH.M_S1, scorerUserId: USER.MAMURI_MEMBER3, assistUserId: USER.MAMURI_CAPTAIN, quarterNumber: 2, team: 'B' },
    { matchId: MATCH.M_S1, scorerUserId: USER.MAMURI_CAPTAIN, assistUserId: null, quarterNumber: 3, team: 'A' },
    { matchId: MATCH.M_S1, scorerUserId: USER.MAMURI_MEMBER1, assistUserId: null, quarterNumber: 3, team: 'B' },
  ];

  // 중복 실행 안전: 해당 matchId 골 기록만 삭제 후 재삽입
  const matchIds = [...new Set(goals.map((g: GoalData) => g.matchId))];
  await prisma.matchGoal.deleteMany({ where: { matchId: { in: matchIds } } });
  await prisma.matchGoal.createMany({ data: goals });

  console.log(`  ✅ 골 기록 ${goals.length}건 완료`);
}

// ─── Step 4. MOM 투표 시딩 ────────────────────────────────────────────────────

async function seedMomVotes() {
  console.log('🏆 MOM 투표 시딩...');

  const votes = [
    // 마무리FC vs 은평FC — 멤버1 2표, 주장 1표 → 멤버1 MOM
    { matchId: MATCH.M_L1, voterId: USER.MAMURI_CAPTAIN, targetUserId: USER.MAMURI_MEMBER1 },
    { matchId: MATCH.M_L1, voterId: USER.MAMURI_VICE, targetUserId: USER.MAMURI_MEMBER1 },
    { matchId: MATCH.M_L1, voterId: USER.MAMURI_MEMBER1, targetUserId: USER.MAMURI_CAPTAIN },
    // 부산FC vs 수영FC — 주장 3표 → 주장 MOM
    { matchId: MATCH.B_L1, voterId: USER.BUSAN_MEMBER1, targetUserId: USER.BUSAN_CAPTAIN },
    { matchId: MATCH.B_L1, voterId: USER.BUSAN_MEMBER2, targetUserId: USER.BUSAN_CAPTAIN },
    // 마무리FC vs 성수FC — 동점 MOM (주장 1표, 부주장 1표)
    { matchId: MATCH.M_L2, voterId: USER.MAMURI_MEMBER1, targetUserId: USER.MAMURI_CAPTAIN },
    { matchId: MATCH.M_L2, voterId: USER.MAMURI_MEMBER2, targetUserId: USER.MAMURI_VICE },
    // 카동FC vs 마무리FC — 카동 주장 2표
    { matchId: MATCH.K_L1, voterId: USER.KADONG_MEMBER, targetUserId: USER.KADONG_CAPTAIN },
  ];

  for (const v of votes) {
    await prisma.momVote.upsert({
      where: { matchId_voterId: { matchId: v.matchId, voterId: v.voterId } },
      update: {},
      create: v,
    });
  }

  console.log(`  ✅ MOM 투표 ${votes.length}건 완료`);
}

// ─── Step 5. MatchParticipant 시딩 (내가 뛴 경기 필터 테스트용) ──────────────

async function seedParticipants() {
  console.log('👥 참가자 시딩...');

  // member1@mamurifc.test(박멤버) 가 참가한 경기들 — "내가 뛴 경기" 필터 시 이것들만 노출
  const participants = [
    { matchId: MATCH.M_L1, userId: USER.MAMURI_MEMBER1 },
    { matchId: MATCH.M_L1, userId: USER.MAMURI_CAPTAIN },
    { matchId: MATCH.M_L1, userId: USER.MAMURI_VICE },
    { matchId: MATCH.M_L2, userId: USER.MAMURI_MEMBER1 },
    { matchId: MATCH.M_S1, userId: USER.MAMURI_MEMBER1 },
    { matchId: MATCH.M_S1, userId: USER.MAMURI_CAPTAIN },
    { matchId: MATCH.M_S1, userId: USER.MAMURI_VICE },
    { matchId: MATCH.M_S1, userId: USER.MAMURI_MEMBER2 },
    { matchId: MATCH.M_S1, userId: USER.MAMURI_MEMBER3 },
    // match.seed 에서 생성된 기록 완료 경기에도 박멤버 참가 추가
    { matchId: 'seed-match-after-league-recorded', userId: USER.MAMURI_MEMBER1 },
    { matchId: 'seed-match-after-league-recorded', userId: USER.MAMURI_CAPTAIN },
    { matchId: 'seed-match-after-league-recorded', userId: USER.MAMURI_VICE },
    { matchId: 'seed-match-after-league-recorded', userId: USER.MAMURI_MEMBER2 },
    // 카동FC 참가자
    { matchId: MATCH.K_L1, userId: USER.KADONG_CAPTAIN },
    { matchId: MATCH.K_L1, userId: USER.KADONG_MEMBER },
    // 부산FC 참가자
    { matchId: MATCH.B_L1, userId: USER.BUSAN_CAPTAIN },
    { matchId: MATCH.B_L1, userId: USER.BUSAN_MEMBER1 },
    { matchId: MATCH.B_L1, userId: USER.BUSAN_MEMBER2 },
  ];

  for (const p of participants) {
    await prisma.matchParticipant.upsert({
      where: { matchId_userId: { matchId: p.matchId, userId: p.userId } },
      update: {},
      create: p,
    });
  }

  console.log(`  ✅ 참가자 ${participants.length}건 완료`);
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 match-feed Seed 시작\n');

  const passwordHash = await bcrypt.hash('test1234!', 10);

  await seedBusanClub(passwordHash);
  await seedFeedMatches();
  await seedGoals();
  await seedMomVotes();
  await seedParticipants();

  console.log('\n✅ match-feed Seed 완료\n');
  console.log('📋 피드에 노출되는 경기:');
  console.log('──────────────────────────────────────────────────────────────────');
  console.log('  [서울 종로구] 마무리FC: LEAGUE×5 + SELF×3 + 기존 2개 = 총 10경기');
  console.log('  [서울 강남구] 카동FC:   LEAGUE×3 + SELF×2         = 총 5경기');
  console.log('  [부산 해운대] 부산FC:   LEAGUE×3 + SELF×2         = 총 5경기');
  console.log('  ─── 합계: 20경기 (피드 1페이지 꽉 채움, 페이지네이션 테스트 가능)');
  console.log('  ─── 제외: 삭제됨 1개 + 기록 미제출 1개');
  console.log('──────────────────────────────────────────────────────────────────');
  console.log('\n🧪 주요 검증 계정:');
  console.log('  captain@mamurifc.test → 내 클럽 필터 → 마무리FC 10경기만 노출');
  console.log('  member1@mamurifc.test → 내가 뛴 경기 → M_L1, M_L2, M_S1, 기존 recorded 경기');
  console.log('  captain@kadongfc.test → 내 클럽 필터 → 카동FC 5경기만 노출');
  console.log('  captain@busanfc.test  → 부산광역시 지역 필터 → 부산FC 5경기만 노출');
  console.log('  newbie@test.com       → "내 클럽만" 토글 비활성 확인');
}

main()
  .catch((e) => {
    console.error('❌ seed 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
