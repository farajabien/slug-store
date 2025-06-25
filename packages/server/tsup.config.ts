import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/adapters/index.ts',
    'src/frameworks/index.ts'
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  external: ['redis', 'ioredis'],
  esbuildOptions(options) {
    options.conditions = ['node']
  }
}) 