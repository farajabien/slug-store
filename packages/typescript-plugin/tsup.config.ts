import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/transformer.ts', 'src/simple-plugin.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['typescript'],
  target: 'es2022',
  splitting: false,
  minify: false, // Keep readable for debugging
}); 