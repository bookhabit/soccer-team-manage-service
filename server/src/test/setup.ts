/**
 * Jest Global Setup — 테스트용 PostgreSQL DB 초기화
 * 테스트 전체에서 단 한 번 실행됨
 */
import { execSync } from 'child_process';
import * as path from 'path';

const TEST_DATABASE_URL =
  'postgresql://ckeh0827:ho0827@localhost:5432/guide-app-test';

module.exports = async () => {
  // 테스트 전용 환경변수 — globalSetup 프로세스에서만 적용
  // 테스트 워커에서는 jest.config.js의 testEnvironment 또는 .env.test 로드
  process.env['DATABASE_URL'] = TEST_DATABASE_URL;
  process.env['JWT_ACCESS_SECRET'] = 'test-access-secret-min-32-characters!!';
  process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-min-32-characters!!';
  process.env['JWT_ACCESS_EXPIRES_IN'] = '15m';
  process.env['JWT_REFRESH_EXPIRES_IN'] = '7d';

  const serverDir = path.resolve(__dirname, '../../');

  // 테스트 DB 스키마 초기화
  execSync('npx prisma db push --force-reset', {
    cwd: serverDir,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'pipe',
  });
};
