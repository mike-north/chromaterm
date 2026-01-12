import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/index.ts'],
  project: ['src/**/*.ts'],
  ignore: [
    'dist/**',
    'temp/**',
    'node_modules/**',
    'api-report/**',
    'docs/**',
    '.nx/**',
  ],
  ignoreDependencies: [
    // These are used in config files
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'eslint-config-prettier',
    '@microsoft/api-extractor',
    '@microsoft/api-documenter',
    '@api-extractor-tools/declaration-file-normalizer',
    'tsup',
    'vitest',
    'tsd',
    'prettier',
    'syncpack',
    'husky',
    'lint-staged',
    'tsx',
  ],
};

export default config;
