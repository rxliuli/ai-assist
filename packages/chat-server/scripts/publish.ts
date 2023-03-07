import { $, fs, path } from 'zx'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const json = await fs.readJson(path.resolve(__dirname, '../package.json'))
await $`pnpm build`
await $`pnpm --prefix ../chat build`
await fs.copy(path.resolve(__dirname, '../../chat/dist'), path.resolve(__dirname, '../dist/public'))
await $`docker buildx build --platform=linux/amd64 -t chat-server .`

await $`docker tag chat-server rxliuli/chat-server:${json.version}`
await $`docker push rxliuli/chat-server:${json.version}`
