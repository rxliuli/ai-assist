import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cssdts } from '@liuli-util/vite-plugin-css-dts'
import { VitePWA } from 'vite-plugin-pwa'
import { i18nextDtsGen } from '@liuli-util/rollup-plugin-i18next-dts-gen'

export default defineConfig({
  base: './',
  plugins: [
    react({ fastRefresh: false }),
    cssdts(),
    i18nextDtsGen({
      dirs: ['src/i18n'],
    }),
    VitePWA({
      registerType: 'autoUpdate',
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
  ],
  build: {
    target: 'esnext',
  },
  server: {
    proxy: {
      // '/api/': 'http://localhost:8080/',
      '/api/': 'http://chat.ai-assist.moe/',
    },
  },
})
