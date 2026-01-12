import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  project: ['src/**/*.ts'],
  ignore: ['dist/**', 'temp/**', 'node_modules/**', 'api-report/**', 'docs/**', '.nx/**'],
  ignoreBinaries: ['vhs'], // VHS is installed via GitHub Action, not npm
  ignoreDependencies: ['@changesets/cli'], // Used via `pnpm changeset` command
};

export default config;
