import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: ['src/main.ts'],
  format: ['cjs'],
  shims: true,
  platform: 'node',
  target: 'esnext',
})
