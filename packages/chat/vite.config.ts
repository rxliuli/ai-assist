import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cssdts } from '@liuli-util/vite-plugin-css-dts'

export default defineConfig({
  plugins: [react(), cssdts()],
})
