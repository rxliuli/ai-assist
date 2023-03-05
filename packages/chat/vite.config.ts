import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cssdts } from '@liuli-util/vite-plugin-css-dts'

export default defineConfig({
  plugins: [react(), cssdts()],
  server: {
    proxy: {
      '/chat': 'http://localhost:8080',
      '/chat-stream': 'http://localhost:8080',
      '/stream-example': 'http://localhost:8080',
    },
  },
})
