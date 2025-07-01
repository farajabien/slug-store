import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    server: 'src/server.ts',
    client: 'src/client.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['react', 'next', 'server-only', 'client-only'],
  splitting: false,
  sourcemap: true,
}); 