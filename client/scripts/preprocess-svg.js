#!/usr/bin/env node
/**
 * preprocess-svg
 * SVG 파일 구조 검증 및 정보 출력
 * 사용: node ./scripts/preprocess-svg.js
 */

const fs = require('fs');
const path = require('path');

const SVG_DIR = path.resolve(__dirname, '../src/shared/ui/icons/svg');
const SUPPORTED_ELEMENTS = ['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'];

function findSvgFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findSvgFiles(full));
    else if (entry.name.endsWith('.svg')) results.push(full);
  }
  return results;
}

function parseSvgElements(content) {
  const found = [];
  const regex = /<(path|circle|rect|line|polyline|polygon|ellipse)\s[^>]*?\/?>/gi;
  let m;
  while ((m = regex.exec(content)) !== null) {
    found.push(m[1].toLowerCase());
  }
  return found;
}

function toPascalCase(str) {
  return str
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

const svgFiles = findSvgFiles(SVG_DIR);

if (svgFiles.length === 0) {
  console.error(`❌ SVG 파일 없음: ${SVG_DIR}`);
  process.exit(1);
}

console.log(`\n📁 SVG 소스 파일 검사 (${svgFiles.length}개)\n`);

let errorCount = 0;

for (const filePath of svgFiles) {
  const relative = path.relative(SVG_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const elements = parseSvgElements(content);
  const unsupported = elements.filter((e) => !SUPPORTED_ELEMENTS.includes(e));

  const fileName = path.basename(filePath, '.svg');
  const componentName = toPascalCase(fileName) + 'Icon';

  if (!content.includes('<svg')) {
    console.log(`  ❌ ${relative} — SVG 루트 태그 없음`);
    errorCount++;
    continue;
  }

  if (elements.length === 0) {
    console.log(`  ⚠️  ${relative} — 렌더링 요소 없음`);
    errorCount++;
    continue;
  }

  if (unsupported.length > 0) {
    console.log(`  ⚠️  ${relative} — 미지원 요소: ${unsupported.join(', ')}`);
  } else {
    console.log(`  ✅ ${relative} → ${componentName} [${elements.join(', ')}]`);
  }
}

console.log(`\n결과: ${svgFiles.length - errorCount}개 통과, ${errorCount}개 오류\n`);

if (errorCount > 0) process.exit(1);
