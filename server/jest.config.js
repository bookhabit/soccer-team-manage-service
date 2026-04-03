/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  // 테스트 DB는 단일 인스턴스 PostgreSQL → 병렬 실행 시 race condition 방지
  maxWorkers: 1,
  // 테스트 워커에서 .env.test 환경변수 로드 (ConfigModule이 .env 대신 .env.test를 읽음)
  setupFiles: ['<rootDir>/src/test/load-env.ts'],
  // 테스트 DB 초기화/정리
  globalSetup: '<rootDir>/src/test/setup.ts',
  globalTeardown: '<rootDir>/src/test/teardown.ts',
};
