import { UserConfig, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cssdts } from '@liuli-util/vite-plugin-css-dts'
import { fs, path } from 'zx'
import dotenv from 'dotenv'

export default defineConfig(async () => {
  const envPath = path.resolve('.env.local')
  let SERVER_URL = 'http://chat.ai-assist.moe/'
  if (await fs.pathExists(envPath)) {
    const env = await fs.readFile(envPath, 'utf-8')
    const url = dotenv.parse(env).SERVER_URL
    if (url) {
      SERVER_URL = url
    }
  }
  return {
    base: './',
    plugins: [react(), cssdts()],
    server: {
      port: 9000,
      proxy: {
        '/api/': SERVER_URL,
      },
    },
  } as UserConfig
})
