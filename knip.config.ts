import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  project: ['src/**/*.ts'],
  ignore: ['dist/**', 'temp/**', 'node_modules/**', 'api-report/**', 'docs/**', '.nx/**'],
};

export default config;
