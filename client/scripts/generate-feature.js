const fs = require('fs');
const path = require('path');

// 1. 인수 받기 (예: node generate-feature.js auth)
const featureName = process.argv[2];

if (!featureName) {
  console.error('❌ 에러: 기능 이름을 입력해주세요. (예: npm run feature auth)');
  process.exit(1);
}

const baseDir = path.join(__dirname, '../src/features', featureName);

// 2. 생성할 폴더 구조 정의
const structure = [
  'ui/container',
  'ui/view',
  'ui/components',
  'data/hooks',
  'data/schemas',
  'data/services',
];

// 3. 폴더 및 기본 index.ts 생성 함수
const generate = () => {
  console.log(`🚀 Feature 생성 시작: ${featureName}`);

  if (fs.existsSync(baseDir)) {
    console.error(`⚠️ 경고: '${featureName}' 폴더가 이미 존재합니다.`);
    process.exit(1);
  }

  structure.forEach((dir) => {
    const fullPath = path.join(baseDir, dir);

    // 폴더 생성
    fs.mkdirSync(fullPath, { recursive: true });

    // 각 폴더에 기본 index.ts 파일 생성 (Barrel Export용)
    const indexPath = path.join(fullPath, 'index.ts');
    const content = `// ${featureName} ${dir} exports\nexport {};\n`;
    fs.writeFileSync(indexPath, content);

    console.log(`✅ 생성 완료: ${dir}`);
  });

  // 기능 루트에 메인 index.ts 생성
  const rootIndexPath = path.join(baseDir, 'index.ts');
  const rootContent = `// ${featureName} Feature Entry Point\nexport * from './ui/container';\nexport * from './data/hooks';\n`;
  fs.writeFileSync(rootIndexPath, rootContent);

  console.log(`\n✨ '${featureName}' 기능 구조 생성이 완료되었습니다!`);
};

generate();
