import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      'server-only': path.resolve(__dirname, './src/server-only-mock.ts'),
      'client-only': path.resolve(__dirname, './src/client-only-mock.ts'),
    },
  },
}); 