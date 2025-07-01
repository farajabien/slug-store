import { config } from '@workspace/eslint-config/base.js';

export default [
  ...config,
  {
    ignores: ['dist/**', '**/*.test.ts'],
  },
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // Allow console.log in debug mode and error handling
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // TypeScript plugin specific rules
      '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
      // Allow empty interfaces for TypeScript Language Service types
      '@typescript-eslint/no-empty-interface': 'off',
    },
  },
]; 