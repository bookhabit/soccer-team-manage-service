import {
  PrismaClient,
  ClubLevel,
  ClubRole,
  PlayerPosition,
  PlayerLevel,
  PlayerFoot,
  Gender,
  RecruitmentStatus,
  MercenaryPostStatus,
  MercenaryApplicationStatus,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── 테스트 계정 정의 ─────────────────────────────────────────────────────────
export const TEST_ACCOUNTS = [
  {
    label: '마무리FC 주장 (용병 구함 등록자)',
    description: '용병 구함 등록·지원자 수락/거절·CLOSED 자동 전환 확인 (phone=010-1111-2222)',
    email: 'captain@mamurifc.test',
    password: 'test1234!',
    role: 'CAPTAIN' as ClubRole,
    clubName: '마무리FC',
  },
  {
    label: '마무리FC 부주장 (phone 없음)',
    description: 'phone 미설정 → 용병 구함 등록 시 AlertDialog 확인 (MERC-05-003)',
    email: 'vice@mamurifc.test',
    password: 'test1234!',
    role: 'VICE_CAPTAIN' as ClubRole,
    clubName: '마무리FC',
  },
  {
    label: '마무리FC 일반 멤버 (권한 없음)',
    description: '일반 멤버 → 용병 구함 등록 버튼 미노출 확인 (MERC-05-014)',
    email: 'member1@mamurifc.test',
    password: 'test1234!',
    role: 'MEMBER' as ClubRole,
    clubName: '마무리FC',
  },
  {
    label: '카동FC 주장 (영입 신청자)',
    description: '용병 가능 게시글에 영입 신청, 내 영입 신청 목록 확인 (phone=010-3333-4444)',
    email: 'captain@kadongfc.test',
    password: 'test1234!',
    role: 'CAPTAIN' as ClubRole,
    clubName: '카동FC',
  },
  {
    label: '용병 가능 등록 유저 (phone 있음)',
    description: '용병 가능 등록 + 영입 신청 수락/거절 + 내 영입 신청 목록 확인',
    email: 'player@mercenary.test',
    password: 'test1234!',
    role: null,
    clubName: null,
  },
  {
    label: '블랙리스트 유저 (mannerScore≤20)',
    description: '용병 구함/가능 등록 시 403 MERCENARY_BLACKLIST 에러 확인 (MERC-05-004, MERC-05-017)',
    email: 'blacklist@mercenary.test',
    password: 'test1234!',
    role: null,
    clubName: null,
  },
  {
    label: '클럽 미소속 유저',
    description: '용병 가능 등록 + 지원하기 기능 확인',
    email: 'newbie@test.com',
    password: 'test1234!',
    role: null,
    clubName: null,
  },
] as const;

// ─── 고정 ID ──────────────────────────────────────────────────────────────────
const IDS = {
  // 지역 (region.code)
  REGION_JONGNO: '1111000000',

  // 기존 유저 (club.seed.ts 재사용)
  USER_MAMURI_CAPTAIN: 'seed-user-mamuri-captain',
  USER_MAMURI_VICE: 'seed-user-mamuri-vice',
  USER_MAMURI_MEMBER1: 'seed-user-mamuri-member1',
  USER_KADONG_CAPTAIN: 'seed-user-kadong-captain',
  USER_NEWBIE: 'seed-user-newbie',

  // 기존 클럽
  CLUB_MAMURI: 'seed-club-mamuri',
  CLUB_KADONG: 'seed-club-kadong',

  // 용병 전용 유저
  USER_PLAYER: 'seed-user-mercenary-player',
  USER_BLACKLIST: 'seed-user-mercenary-blacklist',

  // MercenaryPost IDs
  POST_OPEN_1: 'seed-merc-post-open-1',        // OPEN, 미래, FW·MF 구함, 지원 없음 (지원 시나리오 진입)
  POST_OPEN_2: 'seed-merc-post-open-2',        // OPEN, 미래, DF 구함, 카동FC 지원 PENDING
  POST_PENDING_ACCEPT: 'seed-merc-post-accept', // OPEN, 미래, 필요인원=1, 카동FC PENDING (수락 시 CLOSED 자동 전환)
  POST_CLOSED: 'seed-merc-post-closed',        // CLOSED, 미래
  POST_EXPIRED: 'seed-merc-post-expired',      // OPEN, 과거 → isExpired=true

  // MercenaryApplication IDs
  APP_PENDING_1: 'seed-merc-app-pending-1',    // 카동FC → POST_OPEN_2 (PENDING)
  APP_FOR_ACCEPT: 'seed-merc-app-for-accept',  // 카동FC → POST_PENDING_ACCEPT (PENDING)

  // MercenaryAvailability IDs
  AVAIL_OPEN: 'seed-merc-avail-open',          // player@, OPEN, 미래 날짜, 영입 신청 없음
  AVAIL_WITH_RECRUIT: 'seed-merc-avail-recruit', // player@, OPEN, 마무리FC 영입 PENDING

  // MercenaryRecruitment IDs
  RECRUIT_PENDING: 'seed-merc-recruit-pending', // 마무리FC → AVAIL_WITH_RECRUIT (PENDING)
};

// ─── Step 1. 기존 유저 phone 업데이트 ─────────────────────────────────────────
async function updateExistingUserPhones() {
  console.log('📱 기존 유저 phone 업데이트...');

  await prisma.user.update({
    where: { id: IDS.USER_MAMURI_CAPTAIN },
    data: { phone: '010-1111-2222' },
  });
  await prisma.user.update({
    where: { id: IDS.USER_MAMURI_VICE },
    data: { phone: null },
  });
  await prisma.user.update({
    where: { id: IDS.USER_KADONG_CAPTAIN },
    data: { phone: '010-3333-4444' },
  });

  console.log('  ✅ 기존 유저 phone 완료');
}

// ─── Step 2. 용병 전용 신규 유저 ──────────────────────────────────────────────
async function seedMercenaryUsers(passwordHash: string, regionId: string) {
  console.log('👤 용병 전용 유저 시딩...');

  // [용병 가능 등록 유저] — phone 있음, 용병 가능 등록 + 영입 신청 수락/거절 주체
  await prisma.user.upsert({
    where: { id: IDS.USER_PLAYER },
    update: { phone: '010-9999-0000' },
    create: {
      id: IDS.USER_PLAYER,
      email: 'player@mercenary.test',
      passwordHash,
      name: '용병플레이어',
      birthYear: 1995,
      gender: Gender.MALE,
      position: PlayerPosition.FW,
      foot: PlayerFoot.RIGHT,
      years: 5,
      level: PlayerLevel.AMATEUR,
      preferredRegionId: regionId,
      isOnboarded: true,
      phone: '010-9999-0000',
    },
  });

  // [블랙리스트 유저] — mannerScore=15 (≤20 → 블랙리스트 조건)
  await prisma.user.upsert({
    where: { id: IDS.USER_BLACKLIST },
    update: { mannerScore: 15 },
    create: {
      id: IDS.USER_BLACKLIST,
      email: 'blacklist@mercenary.test',
      passwordHash,
      name: '블랙리스트유저',
      birthYear: 1988,
      gender: Gender.MALE,
      position: PlayerPosition.DF,
      foot: PlayerFoot.LEFT,
      years: 3,
      level: PlayerLevel.BEGINNER,
      preferredRegionId: regionId,
      isOnboarded: true,
      phone: '010-0000-1111',
      mannerScore: 15,
    },
  });

  console.log('  ✅ 용병 전용 유저 2명 완료');
}

// ─── Step 3. 용병 구함 게시글 ──────────────────────────────────────────────────
async function seedMercenaryPosts(regionId: string) {
  console.log('📋 용병 구함 게시글 시딩...');

  const posts = [
    // [POST_OPEN_1] 마무리FC, OPEN, 미래, FW·MF 구함, 지원 없음
    // → 카동FC 주장으로 로그인해서 "지원하기" 시나리오 검증 (MERC-05-008, MERC-05-009)
    {
      id: IDS.POST_OPEN_1,
      clubId: IDS.CLUB_MAMURI,
      createdBy: IDS.USER_MAMURI_CAPTAIN,
      positions: [PlayerPosition.FW, PlayerPosition.MF],
      requiredCount: 2,
      acceptedCount: 0,
      matchDate: new Date('2026-07-05T00:00:00.000Z'),
      startTime: '14:00',
      endTime: '16:00',
      location: '서울 월드컵경기장 A구장',
      address: '서울특별시 마포구 월드컵로 240',
      regionId,
      level: ClubLevel.AMATEUR,
      fee: 0,
      description: '공격적인 플레이 가능하신 분 환영합니다.',
      contactName: '김주장',
      contactPhone: '010-1111-2222',
      status: MercenaryPostStatus.OPEN,
    },

    // [POST_OPEN_2] 마무리FC, OPEN, 미래, DF 구함, 카동FC 지원 PENDING
    // → 지원자 관리 페이지 진입, 수락/거절 동작 확인 (MERC-05-011, MERC-05-013)
    {
      id: IDS.POST_OPEN_2,
      clubId: IDS.CLUB_MAMURI,
      createdBy: IDS.USER_MAMURI_CAPTAIN,
      positions: [PlayerPosition.DF],
      requiredCount: 2,
      acceptedCount: 0,
      matchDate: new Date('2026-07-12T00:00:00.000Z'),
      startTime: '10:00',
      endTime: '12:00',
      location: '뚝섬 유수지 풋살장',
      regionId,
      level: ClubLevel.SEMI_PRO,
      fee: 5000,
      contactName: '김주장',
      contactPhone: '010-1111-2222',
      status: MercenaryPostStatus.OPEN,
    },

    // [POST_PENDING_ACCEPT] 마무리FC, OPEN, requiredCount=1, 카동FC PENDING
    // → 수락 클릭 시 acceptedCount(1)==requiredCount(1) → CLOSED 자동 전환 (MERC-05-012)
    {
      id: IDS.POST_PENDING_ACCEPT,
      clubId: IDS.CLUB_MAMURI,
      createdBy: IDS.USER_MAMURI_CAPTAIN,
      positions: [PlayerPosition.GK],
      requiredCount: 1,
      acceptedCount: 0,
      matchDate: new Date('2026-07-20T00:00:00.000Z'),
      startTime: '09:00',
      endTime: '11:00',
      location: '잠실 보조구장',
      regionId,
      level: ClubLevel.AMATEUR,
      fee: 0,
      description: '골키퍼 1명만 필요합니다.',
      contactName: '김주장',
      contactPhone: '010-1111-2222',
      status: MercenaryPostStatus.OPEN,
    },

    // [POST_CLOSED] 마무리FC, CLOSED
    // → 수정 버튼 비노출 확인 (MERC-05-006)
    {
      id: IDS.POST_CLOSED,
      clubId: IDS.CLUB_MAMURI,
      createdBy: IDS.USER_MAMURI_CAPTAIN,
      positions: [PlayerPosition.FW],
      requiredCount: 1,
      acceptedCount: 1,
      matchDate: new Date('2026-06-28T00:00:00.000Z'),
      startTime: '16:00',
      endTime: '18:00',
      location: '강남 실내 풋살장',
      regionId,
      level: ClubLevel.AMATEUR,
      fee: 10000,
      contactName: '김주장',
      contactPhone: '010-1111-2222',
      status: MercenaryPostStatus.CLOSED,
    },

    // [POST_EXPIRED] 마무리FC, OPEN, 과거 날짜 → isExpired=true
    // → 기본 목록 제외 확인 (MERC-05-019)
    {
      id: IDS.POST_EXPIRED,
      clubId: IDS.CLUB_MAMURI,
      createdBy: IDS.USER_MAMURI_CAPTAIN,
      positions: [PlayerPosition.MF],
      requiredCount: 1,
      acceptedCount: 0,
      matchDate: new Date('2025-12-01T00:00:00.000Z'),
      startTime: '10:00',
      endTime: '12:00',
      location: '노원 풋살장',
      regionId,
      level: ClubLevel.BEGINNER,
      fee: 0,
      contactName: '김주장',
      contactPhone: '010-1111-2222',
      status: MercenaryPostStatus.OPEN,
    },
  ];

  for (const post of posts) {
    await prisma.mercenaryPost.upsert({
      where: { id: post.id },
      update: { status: post.status, acceptedCount: post.acceptedCount },
      create: post,
    });
  }

  console.log(`  ✅ 용병 구함 게시글 ${posts.length}개 완료`);
}

// ─── Step 4. 용병 신청 ────────────────────────────────────────────────────────
async function seedMercenaryApplications() {
  console.log('📨 용병 신청 시딩...');

  const applications = [
    // [APP_PENDING_1] 카동FC 주장 → POST_OPEN_2 (PENDING)
    // → 지원자 관리 페이지에서 수락/거절 동작 확인 (MERC-05-011, MERC-05-013)
    {
      id: IDS.APP_PENDING_1,
      postId: IDS.POST_OPEN_2,
      applicantId: IDS.USER_KADONG_CAPTAIN,
      message: '안녕하세요 카동FC입니다. 수비 잘합니다!',
      status: MercenaryApplicationStatus.PENDING,
    },

    // [APP_FOR_ACCEPT] 카동FC 주장 → POST_PENDING_ACCEPT (PENDING)
    // → 수락 시 requiredCount 충족 → 게시글 자동 CLOSED (MERC-05-012)
    {
      id: IDS.APP_FOR_ACCEPT,
      postId: IDS.POST_PENDING_ACCEPT,
      applicantId: IDS.USER_KADONG_CAPTAIN,
      message: '골키퍼 담당입니다! 잘 부탁드립니다.',
      status: MercenaryApplicationStatus.PENDING,
    },
  ];

  for (const app of applications) {
    await prisma.mercenaryApplication.upsert({
      where: { id: app.id },
      update: { status: app.status },
      create: app,
    });
  }

  console.log(`  ✅ 용병 신청 ${applications.length}건 완료`);
}

// ─── Step 5. 용병 가능 게시글 ─────────────────────────────────────────────────
async function seedMercenaryAvailabilities(regionId: string) {
  console.log('🙋 용병 가능 게시글 시딩...');

  const availabilities = [
    // [AVAIL_OPEN] player@, OPEN, 미래 날짜, 영입 신청 없음
    // → 카동FC 주장이 "영입 신청" 버튼 탭하는 시나리오 진입점 (MERC-05-020, MERC-05-021)
    {
      id: IDS.AVAIL_OPEN,
      userId: IDS.USER_PLAYER,
      positions: [PlayerPosition.FW, PlayerPosition.MF],
      availableDates: [
        new Date('2026-07-06'),
        new Date('2026-07-13'),
        new Date('2026-07-20'),
      ],
      regionIds: [regionId],
      timeSlot: '저녁 18시 이후',
      bio: '공격수·미드필더 모두 가능. 경험 5년. 빠른 발이 장점입니다.',
      acceptsFee: true,
    },

    // [AVAIL_WITH_RECRUIT] player@, OPEN, 마무리FC 영입 PENDING 존재
    // → player@ 로그인 → "내 영입 신청" 탭 → PENDING 수락/거절 확인 (MERC-05-023~025)
    {
      id: IDS.AVAIL_WITH_RECRUIT,
      userId: IDS.USER_PLAYER,
      positions: [PlayerPosition.DF],
      availableDates: [
        new Date('2026-07-05'),
        new Date('2026-07-12'),
      ],
      regionIds: [regionId],
      timeSlot: '주말 오전',
      bio: '수비형 미드필더·수비수 가능. 주말 경기 선호.',
      acceptsFee: false,
    },
  ];

  for (const avail of availabilities) {
    await prisma.mercenaryAvailability.upsert({
      where: { id: avail.id },
      update: {},
      create: avail,
    });
  }

  console.log(`  ✅ 용병 가능 게시글 ${availabilities.length}개 완료`);
}

// ─── Step 6. 영입 신청 ────────────────────────────────────────────────────────
async function seedMercenaryRecruitments() {
  console.log('📥 영입 신청 시딩...');

  // [RECRUIT_PENDING] 마무리FC → AVAIL_WITH_RECRUIT (PENDING)
  // → player@로 로그인 → 내 영입 신청 탭 → PENDING 목록 확인 (MERC-05-023, MERC-05-024)
  await prisma.mercenaryRecruitment.upsert({
    where: { id: IDS.RECRUIT_PENDING },
    update: { status: MercenaryApplicationStatus.PENDING },
    create: {
      id: IDS.RECRUIT_PENDING,
      availabilityId: IDS.AVAIL_WITH_RECRUIT,
      recruitingClubId: IDS.CLUB_MAMURI,
      recruitedBy: IDS.USER_MAMURI_CAPTAIN,
      message: '마무리FC입니다. 이번 주말 경기 함께하실 수 있을까요?',
      contactName: '김주장',
      contactPhone: '010-1111-2222',
      status: MercenaryApplicationStatus.PENDING,
    },
  });

  console.log('  ✅ 영입 신청 1건 완료');
}

// ─── main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌱 Mercenary Seed 시작\n');

  const region = await prisma.region.findUnique({ where: { code: IDS.REGION_JONGNO } });
  if (!region) {
    throw new Error('종로구 지역 데이터 없음. npm run db:seed (regions) 먼저 실행하세요.');
  }

  const passwordHash = await bcrypt.hash('test1234!', 10);

  await updateExistingUserPhones();
  await seedMercenaryUsers(passwordHash, region.id);
  await seedMercenaryPosts(region.id);
  await seedMercenaryApplications();
  await seedMercenaryAvailabilities(region.id);
  await seedMercenaryRecruitments();

  console.log('\n✅ Mercenary Seed 완료\n');
  console.log('📋 테스트 계정:');
  console.log('─────────────────────────────────────────────────────────────────');
  TEST_ACCOUNTS.forEach((acc) => {
    console.log(`  ${acc.label}`);
    console.log(`    이메일: ${acc.email} / 비밀번호: test1234!`);
  });
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('\n📋 생성된 데이터:');
  console.log('  POST_OPEN_1       마무리FC, OPEN, 2026-07-05, FW·MF, 지원 없음');
  console.log('  POST_OPEN_2       마무리FC, OPEN, 2026-07-12, DF, 카동FC PENDING');
  console.log('  POST_PENDING_ACCEPT 마무리FC, OPEN, requiredCount=1, 카동FC PENDING (수락→CLOSED)');
  console.log('  POST_CLOSED       마무리FC, CLOSED, 2026-06-28');
  console.log('  POST_EXPIRED      마무리FC, OPEN, 2025-12-01 (과거→isExpired)');
  console.log('  AVAIL_OPEN        player@, FW·MF, 7/6·7/13·7/20, 영입 신청 없음');
  console.log('  AVAIL_WITH_RECRUIT player@, DF, 7/5·7/12, 마무리FC PENDING 영입 신청');
}

main()
  .catch((e) => {
    console.error('❌ Seed 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
