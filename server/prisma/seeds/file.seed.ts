import { PrismaClient, ClubRole, PlayerPosition, PlayerFoot, PlayerLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── 테스트 계정 정의 (테스트 로그인 페이지에서 사용) ─────────────────────
export const TEST_ACCOUNTS = [
  {
    label: '마무리FC 주장 — 아바타 없음 (신규 업로드)',
    description: '프로필 편집 → 아바타 터치 → 갤러리 선택 → 업로드 확인 (FILE-04-011)',
    email: 'captain@mamurifc.test',
    password: 'test1234!',
    role: 'CAPTAIN' as ClubRole,
    clubName: '마무리FC',
  },
  {
    label: '마무리FC 부주장 — 클럽 로고 업로드 (VICE_CAPTAIN)',
    description: '클럽 설정 → 클럽 로고 변경 → 부주장도 업로드 가능 확인 (FILE-04-006)',
    email: 'vice@mamurifc.test',
    password: 'test1234!',
    role: 'VICE_CAPTAIN' as ClubRole,
    clubName: '마무리FC',
  },
  {
    label: '마무리FC 일반 멤버 — 로고 변경 불가',
    description: '클럽 설정 → 클럽 로고 변경 메뉴 미노출 확인 (FILE-01-004)',
    email: 'member1@mamurifc.test',
    password: 'test1234!',
    role: 'MEMBER' as ClubRole,
    clubName: '마무리FC',
  },
  {
    label: '파일업로드 전용 유저 — 재업로드·삭제 테스트',
    description: '업로드 후 재업로드 → 이전 파일 대체 / 삭제 → 기본 이미지 복원 (FILE-04-012, FILE-04-003)',
    email: 'file-with-avatar@test.com',
    password: 'test1234!',
    role: null,
    clubName: null,
  },
  {
    label: '클럽 미소속 유저 — 기본 이미지 표시',
    description: 'avatarUrl=null → 기본 이미지 자동 표시 확인 (FILE-02-013)',
    email: 'newbie@test.com',
    password: 'test1234!',
    role: null,
    clubName: null,
  },
] as const;

async function seedFile() {
  // ── 공통 해시 ──────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('test1234!', 10);

  // ── 지역 조회 ──────────────────────────────────────────────────────────────
  const region = await prisma.region.findFirst({ where: { name: '서울특별시' } });
  const regionId = region?.id;

  // ── 기존 유저 upsert (아바타 초기화 — 클린 테스트 상태) ─────────────────

  // [마무리FC 주장] avatarUrl=null 리셋 → 신규 업로드 테스트용
  await prisma.user.upsert({
    where: { email: 'captain@mamurifc.test' },
    update: { avatarUrl: null },
    create: {
      email: 'captain@mamurifc.test',
      passwordHash,
      name: '마무리캡틴',
      position: PlayerPosition.FW,
      foot: PlayerFoot.RIGHT,
      level: PlayerLevel.SEMI_PRO,
      preferredRegionId: regionId,
    },
  });

  // [마무리FC 부주장] 기존 유지
  await prisma.user.upsert({
    where: { email: 'vice@mamurifc.test' },
    update: {},
    create: {
      email: 'vice@mamurifc.test',
      passwordHash,
      name: '마무리부주장',
      position: PlayerPosition.MF,
      foot: PlayerFoot.LEFT,
      level: PlayerLevel.AMATEUR,
      preferredRegionId: regionId,
    },
  });

  // [마무리FC 일반 멤버] 기존 유지
  await prisma.user.upsert({
    where: { email: 'member1@mamurifc.test' },
    update: {},
    create: {
      email: 'member1@mamurifc.test',
      passwordHash,
      name: '마무리멤버1',
      position: PlayerPosition.DF,
      foot: PlayerFoot.RIGHT,
      level: PlayerLevel.BEGINNER,
      preferredRegionId: regionId,
    },
  });

  // [클럽 미소속 유저] avatarUrl=null 확인용
  await prisma.user.upsert({
    where: { email: 'newbie@test.com' },
    update: { avatarUrl: null },
    create: {
      email: 'newbie@test.com',
      passwordHash,
      name: '새내기유저',
      preferredRegionId: regionId,
    },
  });

  // [파일업로드 전용 유저] 재업로드·삭제 시나리오 전용
  await prisma.user.upsert({
    where: { email: 'file-with-avatar@test.com' },
    update: {},
    create: {
      email: 'file-with-avatar@test.com',
      passwordHash,
      name: '아바타보유유저',
      avatarUrl: null,
      preferredRegionId: regionId,
    },
  });

  console.log('  ✔ 유저 upsert 완료');

  // ── 마무리FC 클럽 logoUrl=null 리셋 → 신규 로고 업로드 테스트용 ──────────
  const mamuriClub = await prisma.club.findFirst({ where: { name: '마무리FC' } });
  if (mamuriClub) {
    await prisma.club.update({
      where: { id: mamuriClub.id },
      data: { logoUrl: null },
    });
    console.log('  ✔ 마무리FC logoUrl 초기화');
  }

  console.log('✅ file seed 완료');
}

async function main() {
  await seedFile();
}

main()
  .catch((e) => {
    console.error('❌ seed 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
