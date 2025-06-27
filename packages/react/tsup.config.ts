import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts'
  },
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  external: ['react', '@farajabien/slug-store-core'],
  onSuccess: 'tsc --noEmit',
}) 