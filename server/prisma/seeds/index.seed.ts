import { execSync } from 'child_process';
import * as path from 'path';

// 실행 순서: club → match → matching → mercenary → match-feed → head-to-head
const SEEDS = [
  'club.seed.ts',
  'match.seed.ts',
  'matching.seed.ts',
  'mercenary.seed.ts',
  'match-feed.seed.ts',
  'head-to-head.seed.ts',
];

const serverRoot = path.resolve(__dirname, '../..');

function runSeed(filename: string) {
  const seedPath = path.join(__dirname, filename);
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`▶  ${filename}`);
  console.log('─'.repeat(60));

  execSync(
    `ts-node --project tsconfig.seed.json "${seedPath}"`,
    { stdio: 'inherit', cwd: serverRoot },
  );
}

async function main() {
  console.log('\n🚀 전체 테스트 데이터 시딩 시작\n');
  console.log(`실행 순서: ${SEEDS.join(' → ')}`);

  for (const seed of SEEDS) {
    runSeed(seed);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('✅ 전체 시딩 완료');
  console.log('═'.repeat(60));
  console.log('\n앱 실행 → 개발 메뉴 → 테스트 로그인 에서 계정 선택\n');
}

main().catch((e) => {
  console.error('❌ 시딩 실패:', e);
  process.exit(1);
});
