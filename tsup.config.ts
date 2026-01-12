import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/abs/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node18',
  splitting: false,
  // Generate .cjs for CJS, .js for ESM
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
});
