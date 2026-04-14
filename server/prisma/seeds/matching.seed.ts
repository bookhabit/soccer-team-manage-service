import {
  PrismaClient,
  ClubLevel,
  ClubRole,
  MatchPostStatus,
  MatchApplicationStatus,
  MatchGender,
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
    label: '마무리FC 주장 (매칭 등록자)',
    description: '매칭 게시글 등록, 신청 수락/거절, 연락처 확인 검증',
    email: 'captain@mamurifc.test',
    password: 'test1234!',
    role: 'CAPTAIN' as ClubRole,
    clubName: '마무리FC',
  },
  {
    label: '마무리FC 부주장 (전화번호 없음)',
    description: '전화번호 미설정 상태 — 매칭 등록/신청 시 phone guard AlertDialog 확인',
    email: 'vice@mamurifc.test',
    password: 'test1234!',
    role: 'VICE_CAPTAIN' as ClubRole,
    clubName: '마무리FC',
  },
  {
    label: '마무리FC 일반 멤버 (권한 없음)',
    description: '일반 멤버는 매칭 등록·신청 버튼 노출 안 됨 확인',
    email: 'member1@mamurifc.test',
    password: 'test1234!',
    role: 'MEMBER' as ClubRole,
    clubName: '마무리FC',
  },
  {
    label: '카동FC 주장 (신청자)',
    description: '마무리FC 게시글에 신청하는 상대팀 주장',
    email: 'captain@kadongfc.test',
    password: 'test1234!',
    role: 'CAPTAIN' as ClubRole,
    clubName: '카동FC',
  },
  {
    label: '한강FC 주장 (3팀 수락 테스트용)',
    description: '복수 팀 신청 후 거절 확인 (MFLOW-04-004)',
    email: 'captain@hangangfc.test',
    password: 'test1234!',
    role: 'CAPTAIN' as ClubRole,
    clubName: '한강FC',
  },
  {
    label: '강남FC 주장 (3팀 수락 테스트용)',
    description: '복수 팀 신청 후 거절 확인 (MFLOW-04-004)',
    email: 'captain@gangnamfc.test',
    password: 'test1234!',
    role: 'CAPTAIN' as ClubRole,
    clubName: '강남FC',
  },
  {
    label: '클럽 미소속 유저',
    description: '클럽 없음 — 매칭 신청 시 권한 에러 확인',
    email: 'newbie@test.com',
    password: 'test1234!',
    role: null,
    clubName: null,
  },
] as const;

// ─── 고정 ID ─────────────────────────────────────────────────────────────────
const IDS = {
  // 기존 club.seed.ts 에서 사용 중인 ID (재사용)
  REGION_JONGNO: '1111000000',
  USER_MAMURI_CAPTAIN: 'seed-user-mamuri-captain',
  USER_MAMURI_VICE: 'seed-user-mamuri-vice',
  USER_MAMURI_MEMBER1: 'seed-user-mamuri-member1',
  USER_KADONG_CAPTAIN: 'seed-user-kadong-captain',
  CLUB_MAMURI: 'seed-club-mamuri',
  CLUB_KADONG: 'seed-club-kadong',

  // matching seed 전용
  USER_HANGANG_CAPTAIN: 'seed-user-hangang-captain',
  USER_GANGNAM_CAPTAIN: 'seed-user-gangnam-captain',
  CLUB_HANGANG: 'seed-club-hangang',
  CLUB_GANGNAM: 'seed-club-gangnam',

  // MatchPost IDs
  POST_OPEN: 'seed-post-open-1',           // OPEN, 미래 날짜, 카동FC 신청 PENDING
  POST_MULTI: 'seed-post-multi-app',        // OPEN, 미래 날짜, 3팀 PENDING (수락/거절 테스트)
  POST_MATCHED: 'seed-post-matched',        // MATCHED (연락처 노출 테스트)
  POST_EXPIRED: 'seed-post-expired',        // OPEN, 과거 날짜 → isExpired=true
  POST_KADONG_OPEN: 'seed-post-kadong-open', // 카동FC 등록, OPEN (마무리FC 신청 전)
  POST_NO_APP: 'seed-post-no-app',          // OPEN, 신청 없음 (빈 상태 테스트)

  // MatchApplication IDs
  APP_PENDING_KADONG: 'seed-app-pending-kadong',  // 카동FC → POST_OPEN (PENDING)
  APP_MULTI_KADONG: 'seed-app-multi-kadong',       // 카동FC → POST_MULTI (PENDING)
  APP_MULTI_HANGANG: 'seed-app-multi-hangang',     // 한강FC → POST_MULTI (PENDING)
  APP_MULTI_GANGNAM: 'seed-app-multi-gangnam',     // 강남FC → POST_MULTI (PENDING)
  APP_MATCHED_MAMURI: 'seed-app-matched-mamuri',   // 마무리FC → POST_MATCHED (ACCEPTED)
};

// ─── Step 1. 기존 유저 phone 필드 업데이트 ────────────────────────────────────
async function updateUserPhones() {
  console.log('📱 유저 phone 업데이트...');

  // 마무리FC 주장: phone 있음 (매칭 등록 가능)
  await prisma.user.update({
    where: { id: IDS.USER_MAMURI_CAPTAIN },
    data: { phone: '010-1111-2222' },
  });

  // 마무리FC 부주장: phone 없음 → phone guard AlertDialog 확인용
  await prisma.user.update({
    where: { id: IDS.USER_MAMURI_VICE },
    data: { phone: null },
  });

  // 카동FC 주장: phone 있음 (매칭 신청 가능)
  await prisma.user.update({
    where: { id: IDS.USER_KADONG_CAPTAIN },
    data: { phone: '010-3333-4444' },
  });

  console.log('  ✅ 마무리FC 주장: phone=010-1111-2222');
  console.log('  ✅ 마무리FC 부주장: phone=null (phone guard 테스트용)');
  console.log('  ✅ 카동FC 주장: phone=010-3333-4444');
}

// ─── Step 2. 추가 유저 (한강FC·강남FC 주장) ──────────────────────────────────
async function seedAdditionalUsers(passwordHash: string, regionId: string) {
  console.log('👤 추가 유저 시딩...');

  const users = [
    // [한강FC] 주장 — 3팀 신청 후 거절 시나리오 (MFLOW-04-004)
    {
      id: IDS.USER_HANGANG_CAPTAIN,
      email: 'captain@hangangfc.test',
      passwordHash,
      name: '한강캡틴',
      birthYear: 1989,
      gender: Gender.MALE,
      position: PlayerPosition.MF,
      foot: PlayerFoot.RIGHT,
      years: 8,
      level: PlayerLevel.AMATEUR,
      preferredRegionId: regionId,
      isOnboarded: true,
      phone: '010-5555-6666',
    },
    // [강남FC] 주장 — 3팀 신청 후 거절 시나리오 (MFLOW-04-004)
    {
      id: IDS.USER_GANGNAM_CAPTAIN,
      email: 'captain@gangnamfc.test',
      passwordHash,
      name: '강남캡틴',
      birthYear: 1991,
      gender: Gender.MALE,
      position: PlayerPosition.FW,
      foot: PlayerFoot.LEFT,
      years: 6,
      level: PlayerLevel.SEMI_PRO,
      preferredRegionId: regionId,
      isOnboarded: true,
      phone: '010-7777-8888',
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { phone: user.phone },
      create: user,
    });
  }

  console.log(`  ✅ 추가 유저 ${users.length}명 완료`);
}

// ─── Step 3. 추가 클럽 (한강FC·강남FC) ───────────────────────────────────────
async function seedAdditionalClubs(regionId: string) {
  console.log('🏟️ 추가 클럽 시딩...');

  const clubs = [
    {
      id: IDS.CLUB_HANGANG,
      name: '한강FC',
      regionId,
      level: ClubLevel.AMATEUR,
      maxMemberCount: 15,
      currentMemberCount: 1,
      recruitmentStatus: RecruitmentStatus.OPEN,
      description: '한강FC 테스트용 클럽',
    },
    {
      id: IDS.CLUB_GANGNAM,
      name: '강남FC',
      regionId,
      level: ClubLevel.SEMI_PRO,
      maxMemberCount: 11,
      currentMemberCount: 1,
      recruitmentStatus: RecruitmentStatus.OPEN,
      description: '강남FC 테스트용 클럽',
    },
  ];

  for (const club of clubs) {
    await prisma.club.upsert({
      where: { id: club.id },
      update: {},
      create: club,
    });
  }

  // 클럽 멤버십
  const memberships = [
    { clubId: IDS.CLUB_HANGANG, userId: IDS.USER_HANGANG_CAPTAIN, role: ClubRole.CAPTAIN, jerseyNumber: 10 },
    { clubId: IDS.CLUB_GANGNAM, userId: IDS.USER_GANGNAM_CAPTAIN, role: ClubRole.CAPTAIN, jerseyNumber: 10 },
  ];

  for (const m of memberships) {
    await prisma.clubMember.upsert({
      where: { clubId_userId: { clubId: m.clubId, userId: m.userId } },
      update: {},
      create: {
        clubId: m.clubId,
        userId: m.userId,
        role: m.role,
        jerseyNumber: m.jerseyNumber,
        speed: 70, shoot: 65, pass: 68, dribble: 72, defense: 60, physical: 75,
      },
    });
  }

  console.log(`  ✅ 추가 클럽 ${clubs.length}개 + 멤버십 ${memberships.length}건 완료`);
}

// ─── Step 4. 매칭 게시글 시딩 ────────────────────────────────────────────────
async function seedMatchPosts(regionId: string) {
  console.log('📋 매칭 게시글 시딩...');

  const futureDate1 = new Date('2026-06-15T00:00:00.000Z');
  const futureDate2 = new Date('2026-06-20T00:00:00.000Z');
  const futureDate3 = new Date('2026-06-01T00:00:00.000Z');
  const futureDate4 = new Date('2026-07-05T00:00:00.000Z');
  const futureDate5 = new Date('2026-07-10T00:00:00.000Z');
  const pastDate = new Date('2025-12-01T00:00:00.000Z'); // 과거 → isExpired

  const posts = [
    // [POST_OPEN] 마무리FC 등록, OPEN, 카동FC PENDING 신청 있음
    // → MPOST-04-011, MPOST-04-016, MFLOW-04-002 검증용
    {
      id: IDS.POST_OPEN,
      clubId: IDS.CLUB_MAMURI,
      createdBy: IDS.USER_MAMURI_CAPTAIN,
      regionId,
      matchDate: futureDate1,
      startTime: '14:00',
      endTime: '16:00',
      location: '서울 월드컵경기장 A구장',
      address: '서울특별시 마포구 월드컵로 240',
      playerCount: 11,
      gender: MatchGender.MIXED,
      level: ClubLevel.AMATEUR,
      fee: 0,
      contactName: '김주장',
      contactPhone: '010-1111-2222',
      status: MatchPostStatus.OPEN,
    },

    // [POST_MULTI] 마무리FC 등록, OPEN, 3팀(카동·한강·강남) 모두 PENDING
    // → MFLOW-04-004: 1팀 수락 시 나머지 2팀 자동 REJECTED 확인
    {
      id: IDS.POST_MULTI,
      clubId: IDS.CLUB_MAMURI,
      createdBy: IDS.USER_MAMURI_CAPTAIN,
      regionId,
      matchDate: futureDate2,
      startTime: '10:00',
      endTime: '12:00',
      location: '뚝섬 유수지 풋살장',
      address: '서울특별시 광진구 자양동 685',
      playerCount: 6,
      gender: MatchGender.MALE,
      level: ClubLevel.AMATEUR,
      fee: 5000,
      contactName: '김주장',
      contactPhone: '010-1111-2222',
      status: MatchPostStatus.OPEN,
    },

    // [POST_MATCHED] 카동FC 등록, MATCHED (마무리FC 수락 완료)
    // → MPOST-01-005, MAPP-04-007, MPOST-04-018/019: 매칭완료 뱃지 + 연락처 노출 확인
    {
      id: IDS.POST_MATCHED,
      clubId: IDS.CLUB_KADONG,
      createdBy: IDS.USER_KADONG_CAPTAIN,
      regionId,
      matchDate: futureDate3,
      startTime: '16:00',
      endTime: '18:00',
      location: '잠실 보조구장',
      address: '서울특별시 송파구 올림픽로 25',
      playerCount: 11,
      gender: MatchGender.MALE,
      level: ClubLevel.SEMI_PRO,
      fee: 10000,
      contactName: '손카동',
      contactPhone: '010-3333-4444',
      status: MatchPostStatus.MATCHED,
    },

    // [POST_EXPIRED] 마무리FC 등록, OPEN이지만 matchDate가 과거 → isExpired=true
    // → MPOST-04-004, MFLOW-05-001: 기본 목록에서 제외, includeExpired로 포함 확인
    {
      id: IDS.POST_EXPIRED,
      clubId: IDS.CLUB_MAMURI,
      createdBy: IDS.USER_MAMURI_CAPTAIN,
      regionId,
      matchDate: pastDate,
      startTime: '09:00',
      endTime: '11:00',
      location: '노원 풋살장',
      playerCount: 5,
      gender: MatchGender.MIXED,
      level: ClubLevel.BEGINNER,
      fee: 0,
      contactName: '김주장',
      contactPhone: '010-1111-2222',
      status: MatchPostStatus.OPEN,
    },

    // [POST_KADONG_OPEN] 카동FC 등록, OPEN, 신청 없음
    // → MFLOW-04-002: 마무리FC 주장이 신청하는 시나리오 진입점
    {
      id: IDS.POST_KADONG_OPEN,
      clubId: IDS.CLUB_KADONG,
      createdBy: IDS.USER_KADONG_CAPTAIN,
      regionId,
      matchDate: futureDate4,
      startTime: '18:00',
      endTime: '20:00',
      location: '강남 실내 풋살장',
      playerCount: 6,
      gender: MatchGender.MALE,
      level: ClubLevel.SEMI_PRO,
      fee: 8000,
      contactName: '손카동',
      contactPhone: '010-3333-4444',
      status: MatchPostStatus.OPEN,
    },

    // [POST_NO_APP] 한강FC 등록, OPEN, 신청 없음
    // → MAPP-05-004: 신청 목록 빈 상태("신청한 팀이 없어요") 확인
    {
      id: IDS.POST_NO_APP,
      clubId: IDS.CLUB_HANGANG,
      createdBy: IDS.USER_HANGANG_CAPTAIN,
      regionId,
      matchDate: futureDate5,
      startTime: '08:00',
      endTime: '10:00',
      location: '한강 시민공원 구장',
      playerCount: 11,
      gender: MatchGender.MIXED,
      level: ClubLevel.BEGINNER,
      fee: 0,
      contactName: '한강캡틴',
      contactPhone: '010-5555-6666',
      status: MatchPostStatus.OPEN,
    },
  ];

  for (const post of posts) {
    await prisma.matchPost.upsert({
      where: { id: post.id },
      update: { status: post.status },
      create: post,
    });
  }

  console.log(`  ✅ 매칭 게시글 ${posts.length}개 완료`);
}

// ─── Step 5. 매칭 신청 시딩 ───────────────────────────────────────────────────
async function seedMatchApplications() {
  console.log('📨 매칭 신청 시딩...');

  const applications = [
    // [APP_PENDING_KADONG] 카동FC → POST_OPEN (PENDING)
    // → MPOST-04-016: 상대팀 상세 페이지에서 신청 버튼 활성 / 이미 신청됨 확인
    // → 카동FC 주장 로그인 후 "내 신청" 탭에서 PENDING 상태 확인
    {
      id: IDS.APP_PENDING_KADONG,
      postId: IDS.POST_OPEN,
      applicantClubId: IDS.CLUB_KADONG,
      applicantUserId: IDS.USER_KADONG_CAPTAIN,
      message: '안녕하세요! 저희 카동FC입니다. 잘 부탁드립니다 😊',
      contactName: '손카동',
      contactPhone: '010-3333-4444',
      status: MatchApplicationStatus.PENDING,
    },

    // [APP_MULTI_KADONG] 카동FC → POST_MULTI (PENDING)
    // → 3팀 PENDING 중 카동FC 수락 시 한강·강남 자동 REJECTED 확인
    {
      id: IDS.APP_MULTI_KADONG,
      postId: IDS.POST_MULTI,
      applicantClubId: IDS.CLUB_KADONG,
      applicantUserId: IDS.USER_KADONG_CAPTAIN,
      message: '카동FC입니다. 수락 부탁드립니다!',
      contactName: '손카동',
      contactPhone: '010-3333-4444',
      status: MatchApplicationStatus.PENDING,
    },

    // [APP_MULTI_HANGANG] 한강FC → POST_MULTI (PENDING)
    {
      id: IDS.APP_MULTI_HANGANG,
      postId: IDS.POST_MULTI,
      applicantClubId: IDS.CLUB_HANGANG,
      applicantUserId: IDS.USER_HANGANG_CAPTAIN,
      message: '한강FC입니다. 열심히 하겠습니다.',
      contactName: '한강캡틴',
      contactPhone: '010-5555-6666',
      status: MatchApplicationStatus.PENDING,
    },

    // [APP_MULTI_GANGNAM] 강남FC → POST_MULTI (PENDING)
    {
      id: IDS.APP_MULTI_GANGNAM,
      postId: IDS.POST_MULTI,
      applicantClubId: IDS.CLUB_GANGNAM,
      applicantUserId: IDS.USER_GANGNAM_CAPTAIN,
      message: '강남FC입니다. 잘 부탁드립니다.',
      contactName: '강남캡틴',
      contactPhone: '010-7777-8888',
      status: MatchApplicationStatus.PENDING,
    },

    // [APP_MATCHED_MAMURI] 마무리FC → POST_MATCHED (ACCEPTED)
    // → MPOST-04-018/019: 수락된 양측에서 연락처 노출 확인
    {
      id: IDS.APP_MATCHED_MAMURI,
      postId: IDS.POST_MATCHED,
      applicantClubId: IDS.CLUB_MAMURI,
      applicantUserId: IDS.USER_MAMURI_CAPTAIN,
      message: '마무리FC입니다. 좋은 경기 기대합니다!',
      contactName: '김주장',
      contactPhone: '010-1111-2222',
      status: MatchApplicationStatus.ACCEPTED,
    },
  ];

  for (const app of applications) {
    await prisma.matchApplication.upsert({
      where: { id: app.id },
      update: { status: app.status },
      create: app,
    });
  }

  console.log(`  ✅ 매칭 신청 ${applications.length}건 완료`);
  console.log('  📌 POST_MULTI 수락/거절 테스트 순서:');
  console.log('     마무리FC 주장 로그인 → 내 게시글 → "뚝섬 유수지 풋살장" → 신청 목록');
  console.log('     → 카동FC "수락" 클릭 → 한강·강남 자동 REJECTED 확인');
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 Matching Seed 시작\n');

  // 지역 조회 (regions seed 먼저 실행 필요)
  const region = await prisma.region.findUnique({ where: { code: IDS.REGION_JONGNO } });
  if (!region) {
    throw new Error('종로구 지역 데이터 없음. npm run db:seed (regions) 먼저 실행하세요.');
  }

  const passwordHash = await bcrypt.hash('test1234!', 10);

  await updateUserPhones();
  await seedAdditionalUsers(passwordHash, region.id);
  await seedAdditionalClubs(region.id);
  await seedMatchPosts(region.id);
  await seedMatchApplications();

  console.log('\n✅ Matching Seed 완료\n');
  console.log('📋 테스트 계정:');
  console.log('─────────────────────────────────────────────────────────────────');
  TEST_ACCOUNTS.forEach((acc) => {
    console.log(`  ${acc.label}`);
    console.log(`    이메일: ${acc.email} / 비밀번호: test1234!`);
    console.log(`    클럽: ${acc.clubName ?? '없음'} / 역할: ${acc.role ?? '미소속'}`);
  });
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('\n📋 생성된 게시글:');
  console.log('  POST_OPEN    마무리FC, OPEN, 2026-06-15, 카동FC PENDING 신청 있음');
  console.log('  POST_MULTI   마무리FC, OPEN, 2026-06-20, 3팀 PENDING (카동/한강/강남)');
  console.log('  POST_MATCHED 카동FC, MATCHED, 2026-06-01, 마무리FC ACCEPTED');
  console.log('  POST_EXPIRED 마무리FC, OPEN, 2025-12-01 (과거 → isExpired)');
  console.log('  POST_KADONG  카동FC, OPEN, 2026-07-05, 신청 없음');
  console.log('  POST_NO_APP  한강FC, OPEN, 2026-07-10, 신청 없음 (빈 상태 확인)');
}

main()
  .catch((e) => {
    console.error('❌ Seed 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
