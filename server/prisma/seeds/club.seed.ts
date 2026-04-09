import { PrismaClient, ClubLevel, ClubRole, RecruitmentStatus, JoinRequestStatus, Gender, PlayerPosition, PlayerFoot, PlayerLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── 테스트 계정 정의 (테스트 로그인 페이지에서 사용) ─────────────────────
export const TEST_ACCOUNTS = [
  {
    label: '마무리FC 주장',
    description: '관리자 권한 전체 검증 (강퇴·승인·설정)',
    email: 'captain@mamurifc.test',
    password: 'test1234!',
    role: 'CAPTAIN' as ClubRole,
    clubName: '마무리FC',
  },
  {
    label: '마무리FC 부주장',
    description: '부주장 권한 검증 (강퇴·승인 가능, 설정 일부 제한)',
    email: 'vice@mamurifc.test',
    password: 'test1234!',
    role: 'VICE_CAPTAIN' as ClubRole,
    clubName: '마무리FC',
  },
  {
    label: '마무리FC 일반 멤버',
    description: '멤버 권한 검증 (관리자 기능 접근 차단 확인)',
    email: 'member1@mamurifc.test',
    password: 'test1234!',
    role: 'MEMBER' as ClubRole,
    clubName: '마무리FC',
  },
  {
    label: '카동FC 주장',
    description: '별도 클럽 주장 (지역 검색·추천 검증)',
    email: 'captain@kadongfc.test',
    password: 'test1234!',
    role: 'CAPTAIN' as ClubRole,
    clubName: '카동FC',
  },
  {
    label: '클럽 미소속 유저',
    description: '클럽 생성·검색·초대 코드 입력 시나리오 검증',
    email: 'newbie@test.com',
    password: 'test1234!',
    role: null,
    clubName: null,
  },
  {
    label: '가입 신청 대기 중 유저',
    description: '이미 PENDING 신청이 있는 상태 (신청 취소 버튼 노출 확인)',
    email: 'pending@test.com',
    password: 'test1234!',
    role: null,
    clubName: null,
  },
  {
    label: '강퇴 이력 유저',
    description: '마무리FC에서 강퇴된 유저 (재가입 신청 시 CLUB_005 에러 확인)',
    email: 'banned@test.com',
    password: 'test1234!',
    role: null,
    clubName: null,
  },
] as const;

// ─── 고정 ID (upsert 안전성을 위해 결정론적 ID 사용) ─────────────────────
const IDS = {
  // 지역
  REGION_JONGNO: '1111000000', // 서울 종로구 (code 기반 조회)
  REGION_GANGNAM: '1168000000', // 서울 강남구

  // 유저
  USER_MAMURI_CAPTAIN: 'seed-user-mamuri-captain',
  USER_MAMURI_VICE: 'seed-user-mamuri-vice',
  USER_MAMURI_MEMBER1: 'seed-user-mamuri-member1',
  USER_MAMURI_MEMBER2: 'seed-user-mamuri-member2',
  USER_MAMURI_MEMBER3: 'seed-user-mamuri-member3',
  USER_KADONG_CAPTAIN: 'seed-user-kadong-captain',
  USER_KADONG_MEMBER: 'seed-user-kadong-member',
  USER_NEWBIE: 'seed-user-newbie',
  USER_PENDING: 'seed-user-pending',
  USER_BANNED: 'seed-user-banned',

  // 클럽
  CLUB_MAMURI: 'seed-club-mamuri',
  CLUB_KADONG: 'seed-club-kadong',
  CLUB_CLOSED: 'seed-club-closed',
};

async function seedUsers(passwordHash: string) {
  console.log('👤 유저 시딩...');

  // 지역 조회 (regions seed가 먼저 실행되어야 함)
  const regionJongno = await prisma.region.findUnique({ where: { code: IDS.REGION_JONGNO } });
  const regionGangnam = await prisma.region.findUnique({ where: { code: IDS.REGION_GANGNAM } });

  if (!regionJongno) throw new Error('종로구 지역 데이터 없음. db:seed (regions) 먼저 실행하세요.');

  const users = [
    // [마무리FC] 주장
    {
      id: IDS.USER_MAMURI_CAPTAIN,
      email: 'captain@mamurifc.test',
      passwordHash,
      name: '김주장',
      birthYear: 1990,
      gender: Gender.MALE,
      position: PlayerPosition.MF,
      foot: PlayerFoot.RIGHT,
      years: 10,
      level: PlayerLevel.SEMI_PRO,
      preferredRegionId: regionJongno.id,
      isOnboarded: true,
    },
    // [마무리FC] 부주장
    {
      id: IDS.USER_MAMURI_VICE,
      email: 'vice@mamurifc.test',
      passwordHash,
      name: '이부주장',
      birthYear: 1992,
      gender: Gender.MALE,
      position: PlayerPosition.DF,
      foot: PlayerFoot.LEFT,
      years: 7,
      level: PlayerLevel.AMATEUR,
      preferredRegionId: regionJongno.id,
      isOnboarded: true,
    },
    // [마무리FC] 일반 멤버 1
    {
      id: IDS.USER_MAMURI_MEMBER1,
      email: 'member1@mamurifc.test',
      passwordHash,
      name: '박멤버',
      birthYear: 1995,
      gender: Gender.MALE,
      position: PlayerPosition.FW,
      foot: PlayerFoot.RIGHT,
      years: 3,
      level: PlayerLevel.AMATEUR,
      preferredRegionId: regionJongno.id,
      isOnboarded: true,
    },
    // [마무리FC] 일반 멤버 2
    {
      id: IDS.USER_MAMURI_MEMBER2,
      email: 'member2@mamurifc.test',
      passwordHash,
      name: '최멤버',
      birthYear: 1993,
      gender: Gender.MALE,
      position: PlayerPosition.GK,
      foot: PlayerFoot.RIGHT,
      years: 5,
      level: PlayerLevel.AMATEUR,
      preferredRegionId: regionJongno.id,
      isOnboarded: true,
    },
    // [마무리FC] 일반 멤버 3 (해체 투표 테스트용 — 동의/거절 시나리오)
    {
      id: IDS.USER_MAMURI_MEMBER3,
      email: 'member3@mamurifc.test',
      passwordHash,
      name: '정멤버',
      birthYear: 1997,
      gender: Gender.MALE,
      position: PlayerPosition.MF,
      foot: PlayerFoot.BOTH,
      years: 2,
      level: PlayerLevel.BEGINNER,
      preferredRegionId: regionJongno.id,
      isOnboarded: true,
    },
    // [카동FC] 주장
    {
      id: IDS.USER_KADONG_CAPTAIN,
      email: 'captain@kadongfc.test',
      passwordHash,
      name: '손카동',
      birthYear: 1988,
      gender: Gender.MALE,
      position: PlayerPosition.FW,
      foot: PlayerFoot.LEFT,
      years: 15,
      level: PlayerLevel.PRO,
      preferredRegionId: regionGangnam?.id ?? regionJongno.id,
      isOnboarded: true,
    },
    // [카동FC] 일반 멤버
    {
      id: IDS.USER_KADONG_MEMBER,
      email: 'member@kadongfc.test',
      passwordHash,
      name: '류카동',
      birthYear: 1994,
      gender: Gender.MALE,
      position: PlayerPosition.DF,
      foot: PlayerFoot.RIGHT,
      years: 4,
      level: PlayerLevel.AMATEUR,
      preferredRegionId: regionGangnam?.id ?? regionJongno.id,
      isOnboarded: true,
    },
    // [미소속] 신규 유저 — 클럽 생성·검색·초대 코드 입력 시나리오
    {
      id: IDS.USER_NEWBIE,
      email: 'newbie@test.com',
      passwordHash,
      name: '홍길동',
      birthYear: 1998,
      gender: Gender.MALE,
      position: PlayerPosition.MF,
      foot: PlayerFoot.RIGHT,
      years: 1,
      level: PlayerLevel.BEGINNER,
      preferredRegionId: regionJongno.id,
      isOnboarded: true,
    },
    // [미소속] 가입 신청 대기 중 유저 — PENDING 상태 신청 있음
    {
      id: IDS.USER_PENDING,
      email: 'pending@test.com',
      passwordHash,
      name: '대기자',
      birthYear: 1996,
      gender: Gender.MALE,
      position: PlayerPosition.FW,
      foot: PlayerFoot.RIGHT,
      years: 2,
      level: PlayerLevel.BEGINNER,
      preferredRegionId: regionJongno.id,
      isOnboarded: true,
    },
    // [미소속] 강퇴 이력 유저 — 마무리FC 재가입 시도 시 CLUB_005 에러
    {
      id: IDS.USER_BANNED,
      email: 'banned@test.com',
      passwordHash,
      name: '강퇴자',
      birthYear: 1991,
      gender: Gender.MALE,
      position: PlayerPosition.DF,
      foot: PlayerFoot.LEFT,
      years: 6,
      level: PlayerLevel.AMATEUR,
      preferredRegionId: regionJongno.id,
      isOnboarded: true,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    });
  }

  console.log(`  ✅ 유저 ${users.length}명 완료`);
  return regionJongno;
}

async function seedClubs(regionJongno: { id: string }) {
  console.log('🏟️ 클럽 시딩...');

  const clubs = [
    // [마무리FC] 정상 클럽 — 주장+부주장+멤버3명 (총 5명), 모집 중
    {
      id: IDS.CLUB_MAMURI,
      name: '마무리FC',
      regionId: regionJongno.id,
      level: ClubLevel.AMATEUR,
      maxMemberCount: 15,
      currentMemberCount: 5,
      recruitmentStatus: RecruitmentStatus.OPEN,
      description: '서울 종로구 기반 아마추어 축구팀입니다. 매주 토요일 오전 활동.',
    },
    // [카동FC] 비교 검증용 클럽 — 주장+멤버1명 (총 2명)
    {
      id: IDS.CLUB_KADONG,
      name: '카동FC',
      regionId: regionJongno.id,
      level: ClubLevel.SEMI_PRO,
      maxMemberCount: 11,
      currentMemberCount: 2,
      recruitmentStatus: RecruitmentStatus.OPEN,
      description: '실력파 위주로 구성된 카동FC. 주중 저녁 활동.',
    },
    // [정원마감FC] 모집 마감 클럽 — CLUB-04-14: 신청 버튼 비활성화 확인용
    {
      id: IDS.CLUB_CLOSED,
      name: '정원마감FC',
      regionId: regionJongno.id,
      level: ClubLevel.PRO,
      maxMemberCount: 2,
      currentMemberCount: 2,
      recruitmentStatus: RecruitmentStatus.CLOSED,
      description: '정원이 꽉 찬 클럽 (모집 마감 UI 확인용)',
    },
  ];

  for (const club of clubs) {
    await prisma.club.upsert({
      where: { id: club.id },
      update: {},
      create: club,
    });
  }

  console.log(`  ✅ 클럽 ${clubs.length}개 완료`);
}

async function seedClubMembers() {
  console.log('👥 클럽 멤버 시딩...');

  const members = [
    // ── 마무리FC 멤버십 ───────────────────────────────────────
    { clubId: IDS.CLUB_MAMURI, userId: IDS.USER_MAMURI_CAPTAIN, role: ClubRole.CAPTAIN, jerseyNumber: 10 },
    { clubId: IDS.CLUB_MAMURI, userId: IDS.USER_MAMURI_VICE, role: ClubRole.VICE_CAPTAIN, jerseyNumber: 7 },
    { clubId: IDS.CLUB_MAMURI, userId: IDS.USER_MAMURI_MEMBER1, role: ClubRole.MEMBER, jerseyNumber: 9 },
    { clubId: IDS.CLUB_MAMURI, userId: IDS.USER_MAMURI_MEMBER2, role: ClubRole.MEMBER, jerseyNumber: 1 },
    { clubId: IDS.CLUB_MAMURI, userId: IDS.USER_MAMURI_MEMBER3, role: ClubRole.MEMBER, jerseyNumber: 4 },
    // ── 카동FC 멤버십 ─────────────────────────────────────────
    { clubId: IDS.CLUB_KADONG, userId: IDS.USER_KADONG_CAPTAIN, role: ClubRole.CAPTAIN, jerseyNumber: 11 },
    { clubId: IDS.CLUB_KADONG, userId: IDS.USER_KADONG_MEMBER, role: ClubRole.MEMBER, jerseyNumber: 5 },
  ];

  for (const m of members) {
    await prisma.clubMember.upsert({
      where: { clubId_userId: { clubId: m.clubId, userId: m.userId } },
      update: {},
      create: {
        clubId: m.clubId,
        userId: m.userId,
        role: m.role,
        jerseyNumber: m.jerseyNumber,
        speed: Math.floor(Math.random() * 40) + 60,
        shoot: Math.floor(Math.random() * 40) + 60,
        pass: Math.floor(Math.random() * 40) + 60,
        dribble: Math.floor(Math.random() * 40) + 60,
        defense: Math.floor(Math.random() * 40) + 60,
        physical: Math.floor(Math.random() * 40) + 60,
      },
    });
  }

  console.log(`  ✅ 클럽 멤버십 ${members.length}건 완료`);
}

async function seedSpecialCases() {
  console.log('⚡ 특수 케이스 데이터 시딩...');

  // ── 유효한 초대 코드 (마무리FC) — CLUB-04-18 유효 코드 입력 성공 ────────
  await prisma.clubInviteCode.upsert({
    where: { code: 'MAMU-VALID' },
    update: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    create: {
      clubId: IDS.CLUB_MAMURI,
      code: 'MAMU-VALID',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: IDS.USER_MAMURI_CAPTAIN,
    },
  });

  // ── 만료된 초대 코드 (마무리FC) — CLUB-04-15 만료 코드 에러 확인 ─────
  await prisma.clubInviteCode.upsert({
    where: { code: 'MAMU-EXPIRED' },
    update: {},
    create: {
      clubId: IDS.CLUB_MAMURI,
      code: 'MAMU-EXPIRED',
      expiresAt: new Date('2024-01-01'),
      createdBy: IDS.USER_MAMURI_CAPTAIN,
    },
  });

  // ── 가입 신청 대기 중 (PENDING 유저 → 마무리FC) ────────────────────────
  // CLUB-04-13: "신청 취소" 버튼 노출 확인
  // CLUB-03-13: 이미 신청 중인 유저가 재신청 시 CLUB_006 에러
  await prisma.clubJoinRequest.upsert({
    where: { clubId_userId: { clubId: IDS.CLUB_MAMURI, userId: IDS.USER_PENDING } },
    update: {},
    create: {
      clubId: IDS.CLUB_MAMURI,
      userId: IDS.USER_PENDING,
      message: '안녕하세요! 열심히 하겠습니다.',
      status: JoinRequestStatus.PENDING,
    },
  });

  // ── 강퇴 기록 (BANNED 유저 ← 마무리FC 주장이 강퇴) ───────────────────
  // CLUB-03-14: 강퇴 이력 있는 유저 재신청 시 CLUB_005 에러
  // CLUB-05-05: 강퇴 후 재가입 불가 확인
  const existingBan = await prisma.clubBanRecord.findFirst({
    where: { clubId: IDS.CLUB_MAMURI, userId: IDS.USER_BANNED },
  });
  if (!existingBan) {
    await prisma.clubBanRecord.create({
      data: {
        clubId: IDS.CLUB_MAMURI,
        userId: IDS.USER_BANNED,
        bannedBy: IDS.USER_MAMURI_CAPTAIN,
      },
    });
  }

  console.log('  ✅ 유효 초대 코드: MAMU-VALID');
  console.log('  ✅ 만료 초대 코드: MAMU-EXPIRED');
  console.log('  ✅ 가입 신청 대기: pending@test.com → 마무리FC');
  console.log('  ✅ 강퇴 기록: banned@test.com (마무리FC 재가입 불가)');
}

async function main() {
  console.log('\n🌱 Club Seed 시작\n');

  const passwordHash = await bcrypt.hash('test1234!', 10);

  const regionJongno = await seedUsers(passwordHash);
  await seedClubs(regionJongno);
  await seedClubMembers();
  await seedSpecialCases();

  console.log('\n✅ Club Seed 완료\n');
  console.log('📋 테스트 계정 목록:');
  console.log('─────────────────────────────────────────────────');
  TEST_ACCOUNTS.forEach((acc) => {
    console.log(`  ${acc.label}`);
    console.log(`    이메일: ${acc.email}`);
    console.log(`    비밀번호: test1234!`);
    console.log(`    클럽: ${acc.clubName ?? '없음'} / 역할: ${acc.role ?? '미소속'}`);
  });
  console.log('─────────────────────────────────────────────────');
  console.log('\n🔑 특수 초대 코드:');
  console.log('  유효: MAMU-VALID  (7일 후 만료)');
  console.log('  만료: MAMU-EXPIRED  (이미 만료)');
}

main()
  .catch((e) => {
    console.error('❌ Seed 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
