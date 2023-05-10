import { $, path, fs } from 'zx'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function build() {
  await Promise.all([$`pnpm build`, $`pnpm --prefix ../chat build`, $`pnpm --prefix ../chat-admin build`])
  await Promise.all([
    fs.copy(path.resolve(__dirname, '../../chat/dist'), path.resolve(__dirname, '../dist/public')),
    fs.copy(path.resolve(__dirname, '../../chat-admin/dist'), path.resolve(__dirname, '../dist/admin')),
  ])
  await $`docker buildx build --platform=linux/amd64 -t chat .`
}
