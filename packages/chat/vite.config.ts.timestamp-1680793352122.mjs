// vite.config.ts
import { defineConfig } from "file:///F:/rust/ai-assist/node_modules/.pnpm/vite@4.1.4_@types+node@18.14.6/node_modules/vite/dist/node/index.js";
import react from "file:///F:/rust/ai-assist/node_modules/.pnpm/@vitejs+plugin-react@3.1.0_vite@4.1.4/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { cssdts } from "file:///F:/rust/ai-assist/node_modules/.pnpm/@liuli-util+vite-plugin-css-dts@0.2.0_vite@4.1.4/node_modules/@liuli-util/vite-plugin-css-dts/dist/index.js";
import { VitePWA } from "file:///F:/rust/ai-assist/node_modules/.pnpm/vite-plugin-pwa@0.14.4_vite@4.1.4/node_modules/vite-plugin-pwa/dist/index.mjs";
import { i18nextDtsGen } from "file:///F:/rust/ai-assist/node_modules/.pnpm/@liuli-util+rollup-plugin-i18next-dts-gen@0.4.3_typescript@4.9.5/node_modules/@liuli-util/rollup-plugin-i18next-dts-gen/dist/index.js";
import { visualizer } from "file:///F:/rust/ai-assist/node_modules/.pnpm/rollup-plugin-visualizer@5.9.0/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { fs, path } from "file:///F:/rust/ai-assist/node_modules/.pnpm/zx@7.2.0/node_modules/zx/build/index.js";
import dotenv from "file:///F:/rust/ai-assist/node_modules/.pnpm/dotenv@16.0.3/node_modules/dotenv/lib/main.js";
var vite_config_default = defineConfig(async () => {
  const envPath = path.resolve(".env.local");
  let SERVER_URL = "http://chat.ai-assist.moe/";
  if (await fs.pathExists(envPath)) {
    const env = await fs.readFile(envPath, "utf-8");
    SERVER_URL = dotenv.parse(env).SERVER_URL;
  }
  console.log("SERVER_URL", SERVER_URL);
  return {
    base: "./",
    plugins: [
      react({
        fastRefresh: false
      }),
      cssdts(),
      i18nextDtsGen({
        dirs: ["src/i18n"]
      }),
      VitePWA({
        registerType: "autoUpdate",
        selfDestroying: true,
        manifest: {
          id: "ai-assist.chat",
          short_name: " Chat",
          name: " Chat",
          icons: [
            {
              src: "/icons/logo512x512.png",
              sizes: "512x512",
              type: "image/png"
            },
            {
              src: "/icons/logo.svg",
              sizes: "any",
              type: "image/svg"
            }
          ],
          file_handlers: [
            {
              action: "./",
              accept: {
                // ref: https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Image_types
                "image/*": [
                  ".apng",
                  ".avif",
                  ".bmp",
                  ".gif",
                  ".ico",
                  ".cur",
                  ".jpg",
                  ".jpeg",
                  ".jfif",
                  ".pjpeg",
                  ".pjp",
                  ".png",
                  ".svg",
                  ".tif",
                  ".tiff",
                  ".webp"
                ]
              }
            }
          ]
        }
      }),
      visualizer()
    ],
    build: {
      target: "esnext"
    },
    server: {
      proxy: {
        "/api/": SERVER_URL
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxydXN0XFxcXGFpLWFzc2lzdFxcXFxwYWNrYWdlc1xcXFxjaGF0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJGOlxcXFxydXN0XFxcXGFpLWFzc2lzdFxcXFxwYWNrYWdlc1xcXFxjaGF0XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9GOi9ydXN0L2FpLWFzc2lzdC9wYWNrYWdlcy9jaGF0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IGNzc2R0cyB9IGZyb20gJ0BsaXVsaS11dGlsL3ZpdGUtcGx1Z2luLWNzcy1kdHMnXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJ1xuaW1wb3J0IHsgaTE4bmV4dER0c0dlbiB9IGZyb20gJ0BsaXVsaS11dGlsL3JvbGx1cC1wbHVnaW4taTE4bmV4dC1kdHMtZ2VuJ1xuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcidcbmltcG9ydCB7IGZzLCBwYXRoIH0gZnJvbSAnengnXG5pbXBvcnQgZG90ZW52IGZyb20gJ2RvdGVudidcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICgpID0+IHtcbiAgY29uc3QgZW52UGF0aCA9IHBhdGgucmVzb2x2ZSgnLmVudi5sb2NhbCcpXG4gIGxldCBTRVJWRVJfVVJMID0gJ2h0dHA6Ly9jaGF0LmFpLWFzc2lzdC5tb2UvJ1xuICBpZiAoYXdhaXQgZnMucGF0aEV4aXN0cyhlbnZQYXRoKSkge1xuICAgIGNvbnN0IGVudiA9IGF3YWl0IGZzLnJlYWRGaWxlKGVudlBhdGgsICd1dGYtOCcpXG4gICAgU0VSVkVSX1VSTCA9IGRvdGVudi5wYXJzZShlbnYpLlNFUlZFUl9VUkxcbiAgfVxuICBjb25zb2xlLmxvZygnU0VSVkVSX1VSTCcsIFNFUlZFUl9VUkwpXG4gIHJldHVybiB7XG4gICAgYmFzZTogJy4vJyxcbiAgICBwbHVnaW5zOiBbXG4gICAgICByZWFjdCh7XG4gICAgICAgIGZhc3RSZWZyZXNoOiBmYWxzZSxcbiAgICAgIH0pLFxuICAgICAgY3NzZHRzKCksXG4gICAgICBpMThuZXh0RHRzR2VuKHtcbiAgICAgICAgZGlyczogWydzcmMvaTE4biddLFxuICAgICAgfSksXG4gICAgICBWaXRlUFdBKHtcbiAgICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICAgIHNlbGZEZXN0cm95aW5nOiB0cnVlLFxuICAgICAgICBtYW5pZmVzdDoge1xuICAgICAgICAgIGlkOiAnYWktYXNzaXN0LmNoYXQnLFxuICAgICAgICAgIHNob3J0X25hbWU6ICcgQ2hhdCcsXG4gICAgICAgICAgbmFtZTogJyBDaGF0JyxcbiAgICAgICAgICBpY29uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvbG9nbzUxMng1MTIucG5nJyxcbiAgICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvbG9nby5zdmcnLFxuICAgICAgICAgICAgICBzaXplczogJ2FueScsXG4gICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9zdmcnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGZpbGVfaGFuZGxlcnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgYWN0aW9uOiAnLi8nLFxuICAgICAgICAgICAgICBhY2NlcHQ6IHtcbiAgICAgICAgICAgICAgICAvLyByZWY6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL3poLUNOL2RvY3MvV2ViL01lZGlhL0Zvcm1hdHMvSW1hZ2VfdHlwZXNcbiAgICAgICAgICAgICAgICAnaW1hZ2UvKic6IFtcbiAgICAgICAgICAgICAgICAgICcuYXBuZycsXG4gICAgICAgICAgICAgICAgICAnLmF2aWYnLFxuICAgICAgICAgICAgICAgICAgJy5ibXAnLFxuICAgICAgICAgICAgICAgICAgJy5naWYnLFxuICAgICAgICAgICAgICAgICAgJy5pY28nLFxuICAgICAgICAgICAgICAgICAgJy5jdXInLFxuICAgICAgICAgICAgICAgICAgJy5qcGcnLFxuICAgICAgICAgICAgICAgICAgJy5qcGVnJyxcbiAgICAgICAgICAgICAgICAgICcuamZpZicsXG4gICAgICAgICAgICAgICAgICAnLnBqcGVnJyxcbiAgICAgICAgICAgICAgICAgICcucGpwJyxcbiAgICAgICAgICAgICAgICAgICcucG5nJyxcbiAgICAgICAgICAgICAgICAgICcuc3ZnJyxcbiAgICAgICAgICAgICAgICAgICcudGlmJyxcbiAgICAgICAgICAgICAgICAgICcudGlmZicsXG4gICAgICAgICAgICAgICAgICAnLndlYnAnLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIHZpc3VhbGl6ZXIoKSxcbiAgICBdLFxuICAgIGJ1aWxkOiB7XG4gICAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwcm94eToge1xuICAgICAgICAnL2FwaS8nOiBTRVJWRVJfVVJMLFxuICAgICAgfSxcbiAgICB9LFxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5UixTQUFTLG9CQUFvQjtBQUN0VCxPQUFPLFdBQVc7QUFDbEIsU0FBUyxjQUFjO0FBQ3ZCLFNBQVMsZUFBZTtBQUN4QixTQUFTLHFCQUFxQjtBQUM5QixTQUFTLGtCQUFrQjtBQUMzQixTQUFTLElBQUksWUFBWTtBQUN6QixPQUFPLFlBQVk7QUFFbkIsSUFBTyxzQkFBUSxhQUFhLFlBQVk7QUFDdEMsUUFBTSxVQUFVLEtBQUssUUFBUSxZQUFZO0FBQ3pDLE1BQUksYUFBYTtBQUNqQixNQUFJLE1BQU0sR0FBRyxXQUFXLE9BQU8sR0FBRztBQUNoQyxVQUFNLE1BQU0sTUFBTSxHQUFHLFNBQVMsU0FBUyxPQUFPO0FBQzlDLGlCQUFhLE9BQU8sTUFBTSxHQUFHLEVBQUU7QUFBQSxFQUNqQztBQUNBLFVBQVEsSUFBSSxjQUFjLFVBQVU7QUFDcEMsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLFFBQ0osYUFBYTtBQUFBLE1BQ2YsQ0FBQztBQUFBLE1BQ0QsT0FBTztBQUFBLE1BQ1AsY0FBYztBQUFBLFFBQ1osTUFBTSxDQUFDLFVBQVU7QUFBQSxNQUNuQixDQUFDO0FBQUEsTUFDRCxRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsUUFDZCxnQkFBZ0I7QUFBQSxRQUNoQixVQUFVO0FBQUEsVUFDUixJQUFJO0FBQUEsVUFDSixZQUFZO0FBQUEsVUFDWixNQUFNO0FBQUEsVUFDTixPQUFPO0FBQUEsWUFDTDtBQUFBLGNBQ0UsS0FBSztBQUFBLGNBQ0wsT0FBTztBQUFBLGNBQ1AsTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxLQUFLO0FBQUEsY0FDTCxPQUFPO0FBQUEsY0FDUCxNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxVQUNBLGVBQWU7QUFBQSxZQUNiO0FBQUEsY0FDRSxRQUFRO0FBQUEsY0FDUixRQUFRO0FBQUE7QUFBQSxnQkFFTixXQUFXO0FBQUEsa0JBQ1Q7QUFBQSxrQkFDQTtBQUFBLGtCQUNBO0FBQUEsa0JBQ0E7QUFBQSxrQkFDQTtBQUFBLGtCQUNBO0FBQUEsa0JBQ0E7QUFBQSxrQkFDQTtBQUFBLGtCQUNBO0FBQUEsa0JBQ0E7QUFBQSxrQkFDQTtBQUFBLGtCQUNBO0FBQUEsa0JBQ0E7QUFBQSxrQkFDQTtBQUFBLGtCQUNBO0FBQUEsa0JBQ0E7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNELFdBQVc7QUFBQSxJQUNiO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsSUFDVjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsU0FBUztBQUFBLE1BQ1g7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
