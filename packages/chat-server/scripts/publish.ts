import { $, fs, path } from 'zx'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const json = await fs.readJson(path.resolve(__dirname, '../../chat/package.json'))
await $`pnpm build`
await $`pnpm run --prefix ../chat build`
await fs.copy(path.resolve(__dirname, '../../chat/dist'), path.resolve(__dirname, '../dist/public'))
await $`docker buildx build --platform=linux/amd64 -t chat .`

await $`docker tag chat rxliuli/chat:latest`
await $`docker push rxliuli/chat:latest`
await $`docker tag chat rxliuli/chat:${json.version}`
await $`docker push rxliuli/chat:${json.version}`
