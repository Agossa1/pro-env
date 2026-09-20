module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  // Add this property to load the mock configuration globally
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/src/infra/migrations/', '/dist/'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
