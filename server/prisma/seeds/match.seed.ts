import {
  PrismaClient,
  AttendanceResponse,
  MatchType,
  PlayerPosition,
  ClubLevel,
} from '@prisma/client';

const prisma = new PrismaClient();

// ─── 테스트 계정 정의 (테스트 로그인 페이지에서 사용) ─────────────────────
export const TEST_ACCOUNTS = [
  {
    label: '마무리FC 주장',
    description: '경기 생성·라인업·기록 입력 등 관리자 기능 전체 검증',
    email: 'captain@mamurifc.test',
    password: 'test1234!',
    role: 'CAPTAIN',
    clubName: '마무리FC',
  },
  {
    label: '마무리FC 부주장',
    description: '부주장 권한 (관리자 기능 동일하게 접근 가능)',
    email: 'vice@mamurifc.test',
    password: 'test1234!',
    role: 'VICE_CAPTAIN',
    clubName: '마무리FC',
  },
  {
    label: '마무리FC 일반 멤버',
    description: '투표·MOM 투표 등 멤버 기능, 관리자 버튼 비노출 확인',
    email: 'member1@mamurifc.test',
    password: 'test1234!',
    role: 'MEMBER',
    clubName: '마무리FC',
  },
  {
    label: '카동FC 주장',
    description: '별도 클럽 경기 목록 독립성 확인',
    email: 'captain@kadongfc.test',
    password: 'test1234!',
    role: 'CAPTAIN',
    clubName: '카동FC',
  },
  {
    label: '클럽 미소속 유저',
    description: '클럽 미소속 시 경기 탭 접근 차단 확인',
    email: 'newbie@test.com',
    password: 'test1234!',
    role: null,
    clubName: null,
  },
] as const;

// ─── 고정 ID ──────────────────────────────────────────────────────────────────
const CLUB_MAMURI = 'seed-club-mamuri';
const CLUB_KADONG = 'seed-club-kadong';

const USER = {
  CAPTAIN: 'seed-user-mamuri-captain',
  VICE: 'seed-user-mamuri-vice',
  MEMBER1: 'seed-user-mamuri-member1',
  MEMBER2: 'seed-user-mamuri-member2',
  MEMBER3: 'seed-user-mamuri-member3',
  KADONG_CAPTAIN: 'seed-user-kadong-captain',
};

const MATCH = {
  // 마무리FC 경기
  BEFORE_SELF: 'seed-match-before-self',
  BEFORE_LEAGUE: 'seed-match-before-league',
  BEFORE_DEADLINE_PASSED: 'seed-match-before-deadline-passed',
  DURING: 'seed-match-during',
  AFTER_LEAGUE_RECORDED: 'seed-match-after-league-recorded',
  AFTER_SELF_NO_RECORD: 'seed-match-after-self-no-record',
  AFTER_MOM_ACTIVE: 'seed-match-after-mom-active',
  // 카동FC 경기
  KADONG_BEFORE: 'seed-match-kadong-before',
};

// ─── 날짜 헬퍼 (기준: 2026-04-10) ────────────────────────────────────────────
const BASE = new Date('2026-04-10T10:00:00+09:00');

function daysFromBase(days: number, hour = 10, minute = 0): Date {
  const d = new Date(BASE);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// ─── Seed 함수 ────────────────────────────────────────────────────────────────

async function seedMatches() {
  console.log('⚽ 경기 시딩...');

  const matches = [
    // ── [MATCH-04-01] 투표 마감 전 자체전 (BEFORE, 3일 후) ─────────────────
    // 시나리오: 경기 목록에 카드 노출, 참석/미정/불참 버튼 활성화
    {
      id: MATCH.BEFORE_SELF,
      clubId: CLUB_MAMURI,
      type: MatchType.SELF,
      title: '마무리FC 자체 훈련전',
      location: '종로구 실내체육관',
      address: '서울특별시 종로구 삼일대로 460',
      startAt: daysFromBase(3, 10, 0),
      endAt: daysFromBase(3, 12, 0),
      voteDeadline: daysFromBase(2, 20, 0),
      isRecordSubmitted: false,
    },
    // ── [MATCH-04-02] 투표 마감 전 매칭전 (BEFORE, 5일 후) ─────────────────
    // 시나리오: 상대팀 정보 노출, 상대팀 수준 배지 확인
    {
      id: MATCH.BEFORE_LEAGUE,
      clubId: CLUB_MAMURI,
      type: MatchType.LEAGUE,
      title: '마무리FC vs 카동FC 정기전',
      location: '광화문 인조잔디구장',
      address: '서울특별시 종로구 세종대로 172',
      startAt: daysFromBase(5, 14, 0),
      endAt: daysFromBase(5, 16, 0),
      voteDeadline: daysFromBase(4, 18, 0),
      opponentName: '카동FC',
      opponentLevel: ClubLevel.SEMI_PRO,
      isRecordSubmitted: false,
    },
    // ── [MATCH-04-12] 투표 마감 지난 경기 (BEFORE, 2일 후, 마감 어제) ──────
    // 시나리오: 투표 버튼 비활성화, "투표 마감" 문구 노출
    {
      id: MATCH.BEFORE_DEADLINE_PASSED,
      clubId: CLUB_MAMURI,
      type: MatchType.SELF,
      title: '정기 훈련전 (투표 마감)',
      location: '성균관대학교 운동장',
      startAt: daysFromBase(2, 9, 0),
      endAt: daysFromBase(2, 11, 0),
      voteDeadline: daysFromBase(-1, 18, 0), // 어제 마감
      isRecordSubmitted: false,
    },
    // ── [MATCH-04-13] 진행 중 경기 (DURING) ────────────────────────────────
    // 시나리오: 경기 상태 "진행중" 배지, 실시간 배너 노출
    {
      id: MATCH.DURING,
      clubId: CLUB_MAMURI,
      type: MatchType.SELF,
      title: '지금 진행중인 경기',
      location: '종로구 체육관',
      startAt: new Date(Date.now() - 30 * 60 * 1000), // 30분 전 시작
      endAt: new Date(Date.now() + 60 * 60 * 1000),   // 1시간 후 종료
      voteDeadline: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전 마감
      isRecordSubmitted: false,
    },
    // ── [MATCH-04-16] 종료 + 기록 완료 매칭전 (AFTER) ─────────────────────
    // 시나리오: 스코어·골·어시스트 노출, MOM 투표 결과 노출
    {
      id: MATCH.AFTER_LEAGUE_RECORDED,
      clubId: CLUB_MAMURI,
      type: MatchType.LEAGUE,
      title: '지난 주 정기전',
      location: '광화문 인조잔디구장',
      startAt: daysFromBase(-7, 14, 0),
      endAt: daysFromBase(-7, 16, 0),
      voteDeadline: daysFromBase(-8, 18, 0),
      opponentName: '한강FC',
      opponentLevel: ClubLevel.AMATEUR,
      homeScore: 3,
      awayScore: 1,
      isRecordSubmitted: true,
      recordedBy: USER.CAPTAIN,
      recordedAt: daysFromBase(-7, 17, 0),
    },
    // ── [MATCH-04-17] 종료 + 기록 없음 자체전 (AFTER) ─────────────────────
    // 시나리오: 기록 없음 → 주장에게 "기록 입력" CTA 버튼 노출
    {
      id: MATCH.AFTER_SELF_NO_RECORD,
      clubId: CLUB_MAMURI,
      type: MatchType.SELF,
      title: '지난 훈련전 (기록 미입력)',
      location: '종로 실내체육관',
      startAt: daysFromBase(-3, 10, 0),
      endAt: daysFromBase(-3, 12, 0),
      voteDeadline: daysFromBase(-4, 20, 0),
      isRecordSubmitted: false,
    },
    // ── [MATCH-04-18/19] 종료 + MOM 투표 진행 중 (AFTER) ──────────────────
    // 시나리오: MOM 후보 목록 노출, 주장은 이미 투표, 멤버는 아직 미투표
    {
      id: MATCH.AFTER_MOM_ACTIVE,
      clubId: CLUB_MAMURI,
      type: MatchType.LEAGUE,
      title: '2주 전 정기전 (MOM 투표 중)',
      location: '서울 구장',
      startAt: daysFromBase(-14, 14, 0),
      endAt: daysFromBase(-14, 16, 0),
      voteDeadline: daysFromBase(-15, 18, 0),
      opponentName: '한강FC',
      opponentLevel: ClubLevel.AMATEUR,
      homeScore: 2,
      awayScore: 2,
      isRecordSubmitted: true,
      recordedBy: USER.CAPTAIN,
      recordedAt: daysFromBase(-14, 17, 0),
    },
    // ── 카동FC 경기 (BEFORE) ──────────────────────────────────────────────
    // 시나리오: 다른 클럽 경기와 격리 확인
    {
      id: MATCH.KADONG_BEFORE,
      clubId: CLUB_KADONG,
      type: MatchType.SELF,
      title: '카동FC 자체 훈련',
      location: '강남 풋살장',
      startAt: daysFromBase(4, 10, 0),
      endAt: daysFromBase(4, 12, 0),
      voteDeadline: daysFromBase(3, 20, 0),
      isRecordSubmitted: false,
    },
  ];

  for (const match of matches) {
    await prisma.match.upsert({
      where: { id: match.id },
      update: {},
      create: match,
    });
  }

  console.log(`  ✅ 경기 ${matches.length}개 완료`);
}

async function seedAttendances() {
  console.log('🗳️ 출석 투표 시딩...');

  // BEFORE_SELF: 주장·부주장 참석, 멤버1 불참, 멤버2·3 미결정
  const beforeSelfAttendances = [
    { matchId: MATCH.BEFORE_SELF, userId: USER.CAPTAIN, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.BEFORE_SELF, userId: USER.VICE, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.BEFORE_SELF, userId: USER.MEMBER1, response: AttendanceResponse.ABSENT },
    { matchId: MATCH.BEFORE_SELF, userId: USER.MEMBER2, response: AttendanceResponse.UNDECIDED },
    { matchId: MATCH.BEFORE_SELF, userId: USER.MEMBER3, response: AttendanceResponse.UNDECIDED },
  ];

  // BEFORE_LEAGUE: 모두 참석
  const beforeLeagueAttendances = [
    { matchId: MATCH.BEFORE_LEAGUE, userId: USER.CAPTAIN, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.BEFORE_LEAGUE, userId: USER.VICE, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.BEFORE_LEAGUE, userId: USER.MEMBER1, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.BEFORE_LEAGUE, userId: USER.MEMBER2, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.BEFORE_LEAGUE, userId: USER.MEMBER3, response: AttendanceResponse.UNDECIDED },
  ];

  // BEFORE_DEADLINE_PASSED: 주장 참석, 부주장 불참, 나머지 미응답 (투표 마감)
  const deadlinePassedAttendances = [
    { matchId: MATCH.BEFORE_DEADLINE_PASSED, userId: USER.CAPTAIN, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.BEFORE_DEADLINE_PASSED, userId: USER.VICE, response: AttendanceResponse.ABSENT },
  ];

  // DURING: 주장·부주장·멤버1 참석
  const duringAttendances = [
    { matchId: MATCH.DURING, userId: USER.CAPTAIN, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.DURING, userId: USER.VICE, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.DURING, userId: USER.MEMBER1, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.DURING, userId: USER.MEMBER2, response: AttendanceResponse.ABSENT },
  ];

  // AFTER_LEAGUE_RECORDED: 모두 참석
  const afterRecordedAttendances = [
    { matchId: MATCH.AFTER_LEAGUE_RECORDED, userId: USER.CAPTAIN, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.AFTER_LEAGUE_RECORDED, userId: USER.VICE, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.AFTER_LEAGUE_RECORDED, userId: USER.MEMBER1, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.AFTER_LEAGUE_RECORDED, userId: USER.MEMBER2, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.AFTER_LEAGUE_RECORDED, userId: USER.MEMBER3, response: AttendanceResponse.ABSENT },
  ];

  // AFTER_SELF_NO_RECORD: 주장·멤버1 참석
  const afterNoRecordAttendances = [
    { matchId: MATCH.AFTER_SELF_NO_RECORD, userId: USER.CAPTAIN, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.AFTER_SELF_NO_RECORD, userId: USER.MEMBER1, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.AFTER_SELF_NO_RECORD, userId: USER.MEMBER2, response: AttendanceResponse.ABSENT },
  ];

  // AFTER_MOM_ACTIVE: 주장·부주장·멤버1·멤버2 참석
  const afterMomAttendances = [
    { matchId: MATCH.AFTER_MOM_ACTIVE, userId: USER.CAPTAIN, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.AFTER_MOM_ACTIVE, userId: USER.VICE, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.AFTER_MOM_ACTIVE, userId: USER.MEMBER1, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.AFTER_MOM_ACTIVE, userId: USER.MEMBER2, response: AttendanceResponse.ATTEND },
    { matchId: MATCH.AFTER_MOM_ACTIVE, userId: USER.MEMBER3, response: AttendanceResponse.ABSENT },
  ];

  // 카동FC
  const kadongAttendances = [
    { matchId: MATCH.KADONG_BEFORE, userId: USER.KADONG_CAPTAIN, response: AttendanceResponse.ATTEND },
  ];

  const all = [
    ...beforeSelfAttendances,
    ...beforeLeagueAttendances,
    ...deadlinePassedAttendances,
    ...duringAttendances,
    ...afterRecordedAttendances,
    ...afterNoRecordAttendances,
    ...afterMomAttendances,
    ...kadongAttendances,
  ];

  for (const a of all) {
    await prisma.matchAttendance.upsert({
      where: { matchId_userId: { matchId: a.matchId, userId: a.userId } },
      update: {},
      create: a,
    });
  }

  console.log(`  ✅ 출석 투표 ${all.length}건 완료`);
}

async function seedGoals() {
  console.log('⚽ 골 기록 시딩...');

  // AFTER_LEAGUE_RECORDED: 3:1 (홈:원정)
  // - 1쿼터: 주장 득점 (부주장 어시스트)
  // - 2쿼터: 멤버1 득점 (어시스트 없음)
  // - 2쿼터: 주장 득점 (멤버1 어시스트)
  const goalsRecorded = [
    {
      matchId: MATCH.AFTER_LEAGUE_RECORDED,
      scorerUserId: USER.CAPTAIN,
      assistUserId: USER.VICE,
      quarterNumber: 1,
      team: null,
    },
    {
      matchId: MATCH.AFTER_LEAGUE_RECORDED,
      scorerUserId: USER.MEMBER1,
      assistUserId: null,
      quarterNumber: 2,
      team: null,
    },
    {
      matchId: MATCH.AFTER_LEAGUE_RECORDED,
      scorerUserId: USER.CAPTAIN,
      assistUserId: USER.MEMBER1,
      quarterNumber: 2,
      team: null,
    },
  ];

  // AFTER_MOM_ACTIVE: 2:2
  const goalsMom = [
    {
      matchId: MATCH.AFTER_MOM_ACTIVE,
      scorerUserId: USER.MEMBER1,
      assistUserId: USER.CAPTAIN,
      quarterNumber: 1,
      team: null,
    },
    {
      matchId: MATCH.AFTER_MOM_ACTIVE,
      scorerUserId: USER.VICE,
      assistUserId: null,
      quarterNumber: 2,
      team: null,
    },
  ];

  const allGoals = [...goalsRecorded, ...goalsMom];

  // goals는 unique key가 없으므로 기존 데이터 삭제 후 재삽입
  await prisma.matchGoal.deleteMany({
    where: { matchId: { in: [MATCH.AFTER_LEAGUE_RECORDED, MATCH.AFTER_MOM_ACTIVE] } },
  });

  await prisma.matchGoal.createMany({ data: allGoals });

  console.log(`  ✅ 골 기록 ${allGoals.length}건 완료`);
}

async function seedLineup() {
  console.log('📋 라인업 시딩...');

  // BEFORE_LEAGUE: 1쿼터 라인업 미리 등록
  const quarterId = 'seed-quarter-before-league-q1';

  await prisma.matchQuarter.upsert({
    where: { id: quarterId },
    update: {},
    create: {
      id: quarterId,
      matchId: MATCH.BEFORE_LEAGUE,
      quarterNumber: 1,
      formation: '4-3-3',
      team: null,
    },
  });

  const assignments = [
    { quarterId, userId: USER.MEMBER2, position: PlayerPosition.GK },
    { quarterId, userId: USER.CAPTAIN, position: PlayerPosition.MF },
    { quarterId, userId: USER.VICE, position: PlayerPosition.DF },
    { quarterId, userId: USER.MEMBER1, position: PlayerPosition.FW },
  ];

  for (const a of assignments) {
    await prisma.matchQuarterAssignment.upsert({
      where: { quarterId_userId: { quarterId: a.quarterId, userId: a.userId } },
      update: {},
      create: a,
    });
  }

  console.log(`  ✅ 라인업 ${assignments.length}명 완료`);
}

async function seedMomVotes() {
  console.log('🏆 MOM 투표 시딩...');

  // AFTER_LEAGUE_RECORDED: 4명 모두 투표 완료
  // 주장 → 멤버1, 부주장 → 멤버1, 멤버1 → 주장, 멤버2 → 주장
  // 결과: 멤버1(2표), 주장(2표)
  const recordedVotes = [
    { matchId: MATCH.AFTER_LEAGUE_RECORDED, voterId: USER.CAPTAIN, targetUserId: USER.MEMBER1 },
    { matchId: MATCH.AFTER_LEAGUE_RECORDED, voterId: USER.VICE, targetUserId: USER.MEMBER1 },
    { matchId: MATCH.AFTER_LEAGUE_RECORDED, voterId: USER.MEMBER1, targetUserId: USER.CAPTAIN },
    { matchId: MATCH.AFTER_LEAGUE_RECORDED, voterId: USER.MEMBER2, targetUserId: USER.CAPTAIN },
  ];

  // AFTER_MOM_ACTIVE: 주장만 투표, 나머지 미투표
  // 주장 → 멤버1 (member1@mamurifc.test 으로 로그인하면 아직 투표 가능)
  const momActiveVotes = [
    { matchId: MATCH.AFTER_MOM_ACTIVE, voterId: USER.CAPTAIN, targetUserId: USER.MEMBER1 },
  ];

  const allVotes = [...recordedVotes, ...momActiveVotes];

  for (const v of allVotes) {
    await prisma.momVote.upsert({
      where: { matchId_voterId: { matchId: v.matchId, voterId: v.voterId } },
      update: {},
      create: v,
    });
  }

  console.log(`  ✅ MOM 투표 ${allVotes.length}건 완료`);
}

async function seedComments() {
  console.log('💬 댓글 시딩...');

  // AFTER_LEAGUE_RECORDED에 댓글 2개
  const existingComments = await prisma.matchComment.count({
    where: { matchId: MATCH.AFTER_LEAGUE_RECORDED },
  });

  if (existingComments === 0) {
    await prisma.matchComment.createMany({
      data: [
        {
          matchId: MATCH.AFTER_LEAGUE_RECORDED,
          authorId: USER.CAPTAIN,
          content: '수고했습니다! 다음 경기도 파이팅 💪',
        },
        {
          matchId: MATCH.AFTER_LEAGUE_RECORDED,
          authorId: USER.MEMBER1,
          content: '좋은 경기였어요. 박멤버 오늘 최고!',
        },
      ],
    });
    console.log('  ✅ 댓글 2건 완료');
  } else {
    console.log('  ⏭️ 댓글 이미 존재, 건너뜀');
  }
}

async function seedOpponentRating() {
  console.log('⭐ 상대팀 평가 시딩...');

  // AFTER_LEAGUE_RECORDED: 이미 평가 완료
  await prisma.opponentRating.upsert({
    where: { matchId: MATCH.AFTER_LEAGUE_RECORDED },
    update: {},
    create: {
      matchId: MATCH.AFTER_LEAGUE_RECORDED,
      ratedByUserId: USER.CAPTAIN,
      score: 4.0,
      review: '상대팀이 매우 친절했고 경기도 재밌었습니다.',
      mvpName: '한강FC 10번 선수',
    },
  });

  // AFTER_MOM_ACTIVE: 평가 미완료 (OpponentRatingForm 테스트용)
  // → 아무것도 생성하지 않음 (주장 로그인 시 평가 폼 노출 확인)

  console.log('  ✅ 상대팀 평가 1건 완료 (AFTER_MOM_ACTIVE는 미평가 상태)');
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 Match Seed 시작\n');

  await seedMatches();
  await seedAttendances();
  await seedGoals();
  await seedLineup();
  await seedMomVotes();
  await seedComments();
  await seedOpponentRating();

  console.log('\n✅ Match Seed 완료\n');
  console.log('📋 생성된 경기 시나리오:');
  console.log('────────────────────────────────────────────────────────────────');
  console.log('  [BEFORE - 자체전]    마무리FC 자체 훈련전 (3일 후, 투표 가능)');
  console.log('  [BEFORE - 매칭전]    마무리FC vs 카동FC 정기전 (5일 후, 투표 가능)');
  console.log('  [BEFORE - 마감]      정기 훈련전 (2일 후, 투표 마감됨)');
  console.log('  [DURING]             지금 진행중인 경기');
  console.log('  [AFTER - 기록완료]   지난 주 정기전 (3:1, 골기록·MOM결과 있음)');
  console.log('  [AFTER - 기록없음]   지난 훈련전 (주장에게 기록입력 CTA 노출)');
  console.log('  [AFTER - MOM진행중]  2주 전 정기전 (주장만 투표, 멤버는 미투표)');
  console.log('────────────────────────────────────────────────────────────────');
  console.log('\n🧪 검증 시나리오:');
  console.log('  captain@mamurifc.test → 경기 생성/수정, 라인업, 기록입력 버튼 노출 확인');
  console.log('  member1@mamurifc.test → 투표 버튼 노출, MOM 투표 가능 상태 확인');
  console.log('  captain@kadongfc.test → 카동FC 경기만 노출되는지 격리 확인');
}

main()
  .catch((e) => {
    console.error('❌ Seed 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
