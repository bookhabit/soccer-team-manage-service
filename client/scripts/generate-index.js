#!/usr/bin/env node
/**
 * generate-index
 * icons/generated/*.tsx 파일을 스캔해서 index.ts 자동 생성
 * 사용: node ./scripts/generate-index.js
 */

const fs = require('fs');
const path = require('path');

const GENERATED_DIR = path.resolve(__dirname, '../src/shared/ui/icons/generated');
const INDEX_PATH = path.join(GENERATED_DIR, 'index.ts');

if (!fs.existsSync(GENERATED_DIR)) {
  console.error(`❌ generated 디렉터리 없음: ${GENERATED_DIR}`);
  process.exit(1);
}

const tsxFiles = fs
  .readdirSync(GENERATED_DIR)
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => path.basename(f, '.tsx'))
  .sort();

if (tsxFiles.length === 0) {
  console.error('❌ 생성된 아이콘 파일 없음. 먼저 build-icons를 실행하세요.');
  process.exit(1);
}

const now = new Date()
  .toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  .replace(/\. /g, '-')
  .replace(/\./g, '')
  .replace(' ', ' ');

const exportLines = tsxFiles.map((name) => `export * from './${name}';`).join('\n');

const content = `// ⚠️ 자동 생성된 파일입니다. 수동으로 수정하지 마세요!
// 생성일시: ${now}
// 재생성: node ./scripts/generate-index.js

${exportLines}
`;

fs.writeFileSync(INDEX_PATH, content, 'utf-8');

console.log(`\n📝 index.ts 생성 완료 (${tsxFiles.length}개 아이콘)\n`);
tsxFiles.forEach((name) => console.log(`  • ${name}Icon`));
console.log();
