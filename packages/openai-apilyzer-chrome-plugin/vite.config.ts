import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export default defineConfig({
  plugins: [react(), crx({ manifest: manifest as any })],
  resolve: {
    alias: {
      'csv-stringify': require.resolve('csv-stringify/browser/esm'),
    },
  },
})
