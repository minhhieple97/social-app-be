import type { Config } from 'jest';
// import { JestConfigWithTsJest } from 'ts-jest/dist/types';
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  coverageDirectory: 'coverage',
  collectCoverage: true,
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  roots: ['src'],
  rootDir: './',
  testMatch: ['<rootDir>/src/**/test/*.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/test/*.ts?(x)', '!**/node_modules/**'],
  coverageThreshold: {
    global: {
      branches: 1,
      functions: 1,
      lines: 1,
      statements: 1
    }
  },
  coverageReporters: ['text-summary', 'lcov'],
  moduleNameMapper: {
    '@authV1/(.*)': ['<rootDir>/src/api/v1/features/auth/$1'],
    '@user/(.*)': ['<rootDir>/src/api/*/features/user/$1'],
    '@post/(.*)': ['<rootDir>/src/api/*/features/post/$1'],
    '@reaction/(.*)': ['<rootDir>/src/api/*/features/reactions/$1'],
    '@comment/(.*)': ['<rootDir>/src/api/*/features/comments/$1'],
    '@follower/(.*)': ['<rootDir>/src/api/*/features/followers/$1'],
    '@notification/(.*)': ['<rootDir>/src/api/*/features/notifications/$1'],
    '@image/(.*)': ['<rootDir>/src/api/*/features/images/$1'],
    '@chat/(.*)': ['<rootDir>/src/api/*/features/chat/$1'],
    '@globalV1/(.*)': ['<rootDir>/src/api/v1/shared/globals/$1'],
    '@serviceV1/(.*)': ['<rootDir>/src/api/v1/shared/services/$1'],
    '@socket/(.*)': ['<rootDir>/src/api/*/shared/sockets/$1'],
    '@worker/(.*)': ['<rootDir>/src/api/*/shared/workers/$1'],
    '@root/(.*)': ['<rootDir>/src/$1']
  },
  moduleDirectories: ['node_modules', 'src']
};

export default config;
