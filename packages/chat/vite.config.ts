import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cssdts } from '@liuli-util/vite-plugin-css-dts'
import { VitePWA } from 'vite-plugin-pwa'
import { i18nextDtsGen } from '@liuli-util/rollup-plugin-i18next-dts-gen'
import { visualizer } from 'rollup-plugin-visualizer'
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
  console.log('SERVER_URL', SERVER_URL)
  return {
    base: './',
    plugins: [
      react({
        fastRefresh: false,
      }),
      cssdts(),
      i18nextDtsGen({
        dirs: ['src/i18n'],
      }),
      VitePWA({
        registerType: 'autoUpdate',
        selfDestroying: true,
        manifest: {
          id: 'ai-assist.chat',
          short_name: ' Chat',
          name: ' Chat',
          icons: [
            {
              src: '/icons/logo512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/icons/logo.svg',
              sizes: 'any',
              type: 'image/svg',
            },
          ],
          file_handlers: [
            {
              action: './',
              accept: {
                // ref: https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Image_types
                'image/*': [
                  '.apng',
                  '.avif',
                  '.bmp',
                  '.gif',
                  '.ico',
                  '.cur',
                  '.jpg',
                  '.jpeg',
                  '.jfif',
                  '.pjpeg',
                  '.pjp',
                  '.png',
                  '.svg',
                  '.tif',
                  '.tiff',
                  '.webp',
                ],
              },
            },
          ],
        },
      }),
      visualizer(),
    ],
    build: {
      target: 'esnext',
    },
    server: {
      proxy: {
        '/api/': SERVER_URL,
      },
    },
  }
})
