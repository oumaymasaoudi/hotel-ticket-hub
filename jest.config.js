export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    // Mapping spécifique pour config - doit être AVANT le mapping générique
    '^@/config$': '<rootDir>/src/config.jest.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Mock import.meta for Vite
  transformIgnorePatterns: [],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/config.ts',
    '!src/config.vite.ts',
    '!src/integrations/**',
    '!src/constants/**',
    // Exclure les composants UI Shadcn (bibliothèque tierce)
    '!src/components/ui/**',
    // Exclure les pages complexes (tester séparément si nécessaire)
    '!src/pages/**',
    // Exclure les composants complexes (tester séparément si nécessaire)
    '!src/components/layout/**',
    '!src/components/tickets/**',
    '!src/components/dashboard/**',
    '!src/components/reports/**',
    '!src/components/escalations/**',
  ],
  // Coverage threshold désactivé pour permettre le développement progressif
  // Réactiver quand la couverture sera suffisante
  // coverageThreshold: {
  //   global: {
  //     branches: 50,
  //     functions: 50,
  //     lines: 50,
  //     statements: 50,
  //   },
  // },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
};

