module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/testFiles/runTests.ts',
  ],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/testFiles/**',
  ],
  moduleNameMapper: {
    '^aws-cf-builder-core(.*)$': '<rootDir>/packages/core$1',
    '^aws-cf-builder-defined-resources(.*)$': '<rootDir>/packages/cf-definedResources$1',
  },
  transform: {
    '^.+.tsx?$': [
      'ts-jest',
      {
        tsconfig: './packages/executor/testFiles/tsconfig.json',
      },
    ],
  },
};
