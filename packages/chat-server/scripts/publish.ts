import { $, fs, path } from 'zx'
import { fileURLToPath } from 'url'
import { build } from './utils'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const json = await fs.readJson(path.resolve(__dirname, '../../chat/package.json'))
await build()

await $`docker tag chat rxliuli/chat:${json.version}`
await $`docker push rxliuli/chat:${json.version}`
await $`docker tag chat rxliuli/chat:latest`
await $`docker push rxliuli/chat:latest`
