/**
 * Jest setupFiles — 테스트 워커 프로세스에서 .env.test 환경변수 로드
 * globalSetup과 달리 이 파일은 각 워커의 실제 process.env에 적용됨
 */
import * as path from 'path';
import * as fs from 'fs';

const envTestPath = path.resolve(__dirname, '../../.env.test');
if (fs.existsSync(envTestPath)) {
  const lines = fs.readFileSync(envTestPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const value = trimmed.slice(eqIdx + 1).replace(/^["']|["']$/g, '');
    process.env[key] = value;
  }
}
