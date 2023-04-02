import { $, path, fs } from 'zx'
import { parse } from 'dotenv'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const c = parse(await fs.readFile(path.resolve(__dirname, '../.env'), 'utf-8'))

await $`pnpm build`
await $`pnpm --prefix ../chat build`
await fs.copy(path.resolve(__dirname, '../../chat/dist'), path.resolve(__dirname, '../dist/public'))
await $`docker buildx build --platform=linux/amd64 -t chat-server .`

if ((await $`docker ps -aq`).stdout.trim().length > 0) {
  await $`docker stop $(docker ps -aq)`
  await $`docker rm $(docker ps -aq)`
}
const e = Object.entries(c)
  .map(([k, v]) => `--env "${k}=${v}"`)
  .join(' ')
const cmd = `docker run ${e} -dp 8090:8080 chat-server`
console.log(cmd)
execSync(cmd)
// await $`docker run ${e} -dp 8090:8080 chat-server`
console.log(`run in http://localhost:8090`)
