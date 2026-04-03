/**
 * Jest Global Teardown — 테스트 DB 데이터 정리
 * PostgreSQL은 파일 삭제 불가, 테이블만 비움
 */
import { execSync } from 'child_process';
import * as path from 'path';

const TEST_DATABASE_URL =
  'postgresql://ckeh0827:ho0827@localhost:5432/guide-app-test';

module.exports = async () => {
  const serverDir = path.resolve(__dirname, '../../');
  // 테이블 초기화 (스키마는 유지)
  execSync('npx prisma db push --force-reset', {
    cwd: serverDir,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'pipe',
  });
};
