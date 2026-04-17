import {
  PrismaClient,
  MatchType,
  ClubLevel,
  MatchPostStatus,
  MatchApplicationStatus,
  MatchGender,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── 테스트 계정 정의 (테스트 로그인 페이지에서 사용) ─────────────────────
export const TEST_ACCOUNTS = [
  {
    label: '마무리FC 주장 — H2H 진입 (7승 2무 3패)',
    description: '피드 상세 → 상대 전적 보기 → 마무리FC vs 카동FC 12경기 이력 (무한스크롤 확인)',
    email: 'captain@mamurifc.test',
    password: 'test1234!',
  },
  {
    label: '마무리FC 일반 멤버 — H2H 진입',
    description: '멤버도 H2H 진입 가능, 카동FC 전적 동일하게 조회',
    email: 'member1@mamurifc.test',
    password: 'test1234!',
  },
  {
    label: '카동FC 주장 — 역방향 H2H',
    description: '카동FC 클럽 ID 기준 H2H → 마무리FC 전적 (승/패 반전)',
    email: 'captain@kadongfc.test',
    password: 'test1234!',
  },
  {
    label: '부산FC 주장 — H2H 빈 상태',
    description: '부산FC vs 마무리FC H2H → 맞대결 이력 없음, 빈 상태 UI 확인',
    email: 'captain@busanfc.test',
    password: 'test1234!',
  },
  {
    label: '클럽 미소속 유저 — 403 차단',
    description: 'H2H API 직접 호출 → 403 H2H_001 에러 확인',
    email: 'newbie@test.com',
    password: 'test1234!',
  },
] as const;

// ─── 고정 ID ──────────────────────────────────────────────────────────────────

// club.seed.ts에서 생성된 유저/클럽 (중복 생성 안 함)
const USER = {
  MAMURI_CAPTAIN: 'seed-user-mamuri-captain',
  MAMURI_VICE: 'seed-user-mamuri-vice',
  MAMURI_MEMBER1: 'seed-user-mamuri-member1',
  KADONG_CAPTAIN: 'seed-user-kadong-captain',
};

const CLUB = {
  MAMURI: 'seed-club-mamuri',
  KADONG: 'seed-club-kadong',
};

// H2H 전용 MatchPost / Application / Match IDs
// 마무리FC(HOST) vs 카동FC(GUEST) — 마무리FC가 게시글 등록, 카동FC가 신청
const H2H_HOST_IDS = {
  POST: [
    'seed-h2h-post-host-1',
    'seed-h2h-post-host-2',
    'seed-h2h-post-host-3',
    'seed-h2h-post-host-4',
    'seed-h2h-post-host-5',
    'seed-h2h-post-host-6',
    'seed-h2h-post-host-7',
    'seed-h2h-post-host-8',
  ],
  APP: [
    'seed-h2h-app-host-1',
    'seed-h2h-app-host-2',
    'seed-h2h-app-host-3',
    'seed-h2h-app-host-4',
    'seed-h2h-app-host-5',
    'seed-h2h-app-host-6',
    'seed-h2h-app-host-7',
    'seed-h2h-app-host-8',
  ],
  MATCH: [
    'seed-h2h-match-host-1',
    'seed-h2h-match-host-2',
    'seed-h2h-match-host-3',
    'seed-h2h-match-host-4',
    'seed-h2h-match-host-5',
    'seed-h2h-match-host-6',
    'seed-h2h-match-host-7',
    'seed-h2h-match-host-8',
  ],
};

// 카동FC(HOST) vs 마무리FC(GUEST) — 카동FC가 게시글 등록, 마무리FC가 신청
const H2H_GUEST_IDS = {
  POST: [
    'seed-h2h-post-guest-1',
    'seed-h2h-post-guest-2',
    'seed-h2h-post-guest-3',
    'seed-h2h-post-guest-4',
  ],
  APP: [
    'seed-h2h-app-guest-1',
    'seed-h2h-app-guest-2',
    'seed-h2h-app-guest-3',
    'seed-h2h-app-guest-4',
  ],
  MATCH: [
    'seed-h2h-match-guest-1',
    'seed-h2h-match-guest-2',
    'seed-h2h-match-guest-3',
    'seed-h2h-match-guest-4',
  ],
};

// ─── 날짜 헬퍼 ────────────────────────────────────────────────────────────────
const BASE = new Date('2026-04-17T00:00:00+09:00');

function daysAgo(days: number, hour = 17): Date {
  const d = new Date(BASE);
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

// ─── 스코어 데이터 ────────────────────────────────────────────────────────────
// 마무리FC 관점: homeScore=마무리 득점(HOST), awayScore=카동 득점(HOST)
// 결과: 7승 2무 3패 / 득점 17 실점 11
// HOST 8경기: W,W,W,W,W,D,L,L (home=my score)
const HOST_SCORES: Array<{ home: number; away: number }> = [
  { home: 3, away: 1 }, // W
  { home: 2, away: 0 }, // W
  { home: 1, away: 0 }, // W
  { home: 2, away: 1 }, // W
  { home: 3, away: 2 }, // W (5 weeks ago)
  { home: 1, away: 1 }, // D
  { home: 0, away: 2 }, // L
  { home: 1, away: 3 }, // L
];
// GUEST 4경기: W,W,D,L (away=my score)
// 마무리FC가 GUEST → away는 마무리 득점
const GUEST_SCORES: Array<{ home: number; away: number }> = [
  { home: 1, away: 2 }, // W (away=마무리 2, home=카동 1)
  { home: 0, away: 1 }, // W
  { home: 2, away: 2 }, // D
  { home: 4, away: 1 }, // L (home=카동 4, away=마무리 1)
];
// 총계: 마무리FC = 7승 2무 3패, 득점 17, 실점 11

// ─── Step 1. 기존 유저/클럽 확인 ─────────────────────────────────────────────

async function checkPrerequisites() {
  const mamuri = await prisma.club.findUnique({ where: { id: CLUB.MAMURI } });
  if (!mamuri) {
    throw new Error('마무리FC 클럽이 없습니다. seed:club 먼저 실행하세요.');
  }
  const kadong = await prisma.club.findUnique({ where: { id: CLUB.KADONG } });
  if (!kadong) {
    throw new Error('카동FC 클럽이 없습니다. seed:club 먼저 실행하세요.');
  }
}

// ─── Step 2. H2H 경기 데이터 생성 ────────────────────────────────────────────

async function seedH2HMatches() {
  console.log('⚔️  H2H 맞대결 경기 시딩...');

  // 서울 종로구 지역 조회 (MatchPost 등록에 필요)
  const region = await prisma.region.findFirst({
    where: { name: '서울특별시', sigungu: '종로구' },
  });
  if (!region) throw new Error('서울특별시 종로구 지역 없음. db:seed 먼저 실행하세요.');

  // ── HOST 시나리오: 마무리FC가 게시글 등록, 카동FC가 신청·수락 ──
  for (let i = 0; i < H2H_HOST_IDS.POST.length; i++) {
    const postId = H2H_HOST_IDS.POST[i];
    const appId = H2H_HOST_IDS.APP[i];
    const matchId = H2H_HOST_IDS.MATCH[i];
    const score = HOST_SCORES[i];
    const matchDate = daysAgo((i + 1) * 14); // 2주 간격

    // MatchPost (마무리FC 등록, MATCHED)
    await prisma.matchPost.upsert({
      where: { id: postId },
      update: {},
      create: {
        id: postId,
        clubId: CLUB.MAMURI,
        createdBy: USER.MAMURI_CAPTAIN,
        regionId: region.id,
        matchDate,
        startTime: '14:00',
        endTime: '16:00',
        location: '서울 종로구 풋살장',
        playerCount: 11,
        gender: MatchGender.MALE,
        level: ClubLevel.AMATEUR,
        fee: 0,
        contactName: '김주장',
        contactPhone: '010-1111-2222',
        status: MatchPostStatus.MATCHED,
      },
    });

    // MatchApplication (카동FC 신청, ACCEPTED)
    await prisma.matchApplication.upsert({
      where: { id: appId },
      update: {},
      create: {
        id: appId,
        postId,
        applicantClubId: CLUB.KADONG,
        applicantUserId: USER.KADONG_CAPTAIN,
        contactName: '손카동',
        contactPhone: '010-3333-4444',
        status: MatchApplicationStatus.ACCEPTED,
      },
    });

    // Match (마무리FC 경기 레코드, 기록 완료)
    await prisma.match.upsert({
      where: { id: matchId },
      update: {},
      create: {
        id: matchId,
        clubId: CLUB.MAMURI,
        type: MatchType.LEAGUE,
        title: `vs 카동FC ${i + 1}차전`,
        location: '서울 종로구 풋살장',
        startAt: matchDate,
        endAt: new Date(matchDate.getTime() + 2 * 60 * 60 * 1000),
        voteDeadline: new Date(matchDate.getTime() - 24 * 60 * 60 * 1000),
        opponentName: '카동FC',
        homeScore: score.home,
        awayScore: score.away,
        isRecordSubmitted: true,
        recordedAt: new Date(matchDate.getTime() + 3 * 60 * 60 * 1000),
        recordedBy: USER.MAMURI_CAPTAIN,
        matchPostId: postId,
      },
    });
  }

  // ── GUEST 시나리오: 카동FC가 게시글 등록, 마무리FC가 신청·수락 ──
  for (let i = 0; i < H2H_GUEST_IDS.POST.length; i++) {
    const postId = H2H_GUEST_IDS.POST[i];
    const appId = H2H_GUEST_IDS.APP[i];
    const matchId = H2H_GUEST_IDS.MATCH[i];
    const score = GUEST_SCORES[i];
    const matchDate = daysAgo((H2H_HOST_IDS.POST.length + i + 1) * 14); // HOST 이후 날짜

    // MatchPost (카동FC 등록, MATCHED)
    await prisma.matchPost.upsert({
      where: { id: postId },
      update: {},
      create: {
        id: postId,
        clubId: CLUB.KADONG,
        createdBy: USER.KADONG_CAPTAIN,
        regionId: region.id,
        matchDate,
        startTime: '10:00',
        endTime: '12:00',
        location: '서울 강남구 풋살장',
        playerCount: 11,
        gender: MatchGender.MALE,
        level: ClubLevel.AMATEUR,
        fee: 5000,
        contactName: '손카동',
        contactPhone: '010-3333-4444',
        status: MatchPostStatus.MATCHED,
      },
    });

    // MatchApplication (마무리FC 신청, ACCEPTED)
    await prisma.matchApplication.upsert({
      where: { id: appId },
      update: {},
      create: {
        id: appId,
        postId,
        applicantClubId: CLUB.MAMURI,
        applicantUserId: USER.MAMURI_CAPTAIN,
        contactName: '김주장',
        contactPhone: '010-1111-2222',
        status: MatchApplicationStatus.ACCEPTED,
      },
    });

    // Match (마무리FC 경기 레코드, GUEST — away는 마무리 득점)
    await prisma.match.upsert({
      where: { id: matchId },
      update: {},
      create: {
        id: matchId,
        clubId: CLUB.MAMURI,
        type: MatchType.LEAGUE,
        title: `vs 카동FC 원정 ${i + 1}차전`,
        location: '서울 강남구 풋살장',
        startAt: matchDate,
        endAt: new Date(matchDate.getTime() + 2 * 60 * 60 * 1000),
        voteDeadline: new Date(matchDate.getTime() - 24 * 60 * 60 * 1000),
        opponentName: '카동FC',
        homeScore: score.home, // 카동FC 득점
        awayScore: score.away, // 마무리FC 득점
        isRecordSubmitted: true,
        recordedAt: new Date(matchDate.getTime() + 3 * 60 * 60 * 1000),
        recordedBy: USER.MAMURI_CAPTAIN,
        matchPostId: postId,
      },
    });
  }

  console.log(
    `✅ H2H 데이터 생성 완료: HOST ${H2H_HOST_IDS.MATCH.length}경기 + GUEST ${H2H_GUEST_IDS.MATCH.length}경기 = 총 12경기`,
  );
  console.log('   마무리FC 관점: 7승 2무 3패 / 득점 17 실점 11');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seedHeadToHead() {
  const passwordHash = await bcrypt.hash('test1234!', 10);
  void passwordHash; // 기존 유저 재사용 — 비밀번호 변경 없음

  await checkPrerequisites();
  await seedH2HMatches();
}

async function main() {
  await seedHeadToHead();
  console.log('✅ head-to-head seed 완료');
}

main()
  .catch((e) => {
    console.error('❌ seed 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
