import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/', 'node_modules/', 'temp/', 'docs/', '.nx/'],
  },
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        // Node.js globals
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript strict rules
      ...tseslint.configs['strict-type-checked'].rules,
      ...tseslint.configs['stylistic-type-checked'].rules,

      // Allow underscore-prefixed unused variables
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Allow ++ and -- operators
      'no-plusplus': 'off',

      // Allow explicit type annotations even when inferrable (useful for public API clarity)
      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },
  // Prettier must be last to disable formatting rules
  prettier,
];
