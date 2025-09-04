import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Carrega .env.test automaticamente
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: ['**/src/__tests__/**/*.spec.ts'],
  // testes em série para evitar corridas no BD
//   runInBand: true,
  // deixa os logs mais limpos
  verbose: false,
};

export default config;
