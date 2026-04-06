#!/usr/bin/env node
/**
 * build-icons
 * icons/svg/**\/*.svg → icons/generated/{PascalCase}.tsx 변환
 * 사용: node ./scripts/build-icons.js
 *       node ./scripts/build-icons.js --force  (이미 존재하는 파일도 덮어쓰기)
 */

const fs = require('fs');
const path = require('path');

const SVG_DIR = path.resolve(__dirname, '../src/shared/ui/icons/svg');
const GENERATED_DIR = path.resolve(__dirname, '../src/shared/ui/icons/generated');

const ELEMENT_MAP = {
  path: 'Path',
  circle: 'Circle',
  rect: 'Rect',
  line: 'Line',
  polyline: 'Polyline',
  polygon: 'Polygon',
  ellipse: 'Ellipse',
};

// Svg 루트에서 처리하는 속성 (개별 요소에서 제거)
// width/height는 <rect> 등 요소의 크기를 나타내므로 제거하지 않음
const STRIP_ATTRS = new Set([
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'fill',
]);

const force = process.argv.includes('--force');

function findSvgFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findSvgFiles(full));
    else if (entry.name.endsWith('.svg')) results.push(full);
  }
  return results;
}

function toPascalCase(str) {
  return str
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function parseAttrs(attrStr) {
  const attrs = {};
  const regex = /(\w[\w-]*)="([^"]*)"/g;
  let m;
  while ((m = regex.exec(attrStr)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function buildElementJSX(tagName, attrStr) {
  const rnTag = ELEMENT_MAP[tagName.toLowerCase()];
  if (!rnTag) return null;

  const attrs = parseAttrs(attrStr);
  const props = Object.entries(attrs)
    .filter(([k]) => !STRIP_ATTRS.has(k))
    .map(([k, v]) => `${toCamelCase(k)}="${v}"`)
    .join(' ');

  return { tag: rnTag, jsx: props ? `      <${rnTag} ${props} />` : `      <${rnTag} />` };
}

function svgToTSX(svgContent, componentName) {
  const elementRegex = /<(path|circle|rect|line|polyline|polygon|ellipse)\s([^>]*?)\/>/gi;
  const jsxLines = [];
  const usedTags = new Set();

  let m;
  while ((m = elementRegex.exec(svgContent)) !== null) {
    const result = buildElementJSX(m[1], m[2]);
    if (result) {
      jsxLines.push(result.jsx);
      usedTags.add(result.tag);
    }
  }

  if (jsxLines.length === 0) {
    throw new Error('렌더링 가능한 요소 없음');
  }

  const namedImports = Array.from(usedTags).sort().join(', ');

  return `import React from 'react';
import Svg, { ${namedImports} } from 'react-native-svg';
import type { IconProps } from '../types';

export function ${componentName}({ size = 24, color = '#191f28', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
${jsxLines.join('\n')}
    </Svg>
  );
}
`;
}

// --- main ---

const svgFiles = findSvgFiles(SVG_DIR);

if (svgFiles.length === 0) {
  console.error(`❌ SVG 파일 없음: ${SVG_DIR}`);
  process.exit(1);
}

if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

console.log(`\n🔨 아이콘 빌드 (${svgFiles.length}개 SVG)\n`);

let created = 0;
let skipped = 0;
let errors = 0;

for (const svgPath of svgFiles) {
  const fileName = path.basename(svgPath, '.svg');
  const componentName = toPascalCase(fileName) + 'Icon';
  const outPath = path.join(GENERATED_DIR, `${toPascalCase(fileName)}.tsx`);
  const relative = path.relative(SVG_DIR, svgPath);

  if (!force && fs.existsSync(outPath)) {
    console.log(`  ⏭  ${relative} → ${toPascalCase(fileName)}.tsx (건너뜀, --force로 덮어쓰기)`);
    skipped++;
    continue;
  }

  try {
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    const tsx = svgToTSX(svgContent, componentName);
    fs.writeFileSync(outPath, tsx, 'utf-8');
    console.log(`  ✅ ${relative} → ${toPascalCase(fileName)}.tsx`);
    created++;
  } catch (e) {
    console.log(`  ❌ ${relative} — ${e.message}`);
    errors++;
  }
}

console.log(`\n결과: ${created}개 생성, ${skipped}개 건너뜀, ${errors}개 오류\n`);
console.log('💡 index.ts 재생성: node ./scripts/generate-index.js\n');

if (errors > 0) process.exit(1);
