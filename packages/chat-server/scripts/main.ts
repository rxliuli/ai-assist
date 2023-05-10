import { $, path, fs } from 'zx'
import { parse } from 'dotenv'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const c = parse(await fs.readFile(path.resolve(__dirname, '../.env'), 'utf-8'))

await Promise.all([$`pnpm build`, $`pnpm --prefix ../chat build`, $`pnpm --prefix ../chat-admin build`])
await fs.copy(path.resolve(__dirname, '../../chat/dist'), path.resolve(__dirname, '../dist/public'))
await fs.copy(path.resolve(__dirname, '../../chat-admin/dist'), path.resolve(__dirname, '../dist/admin'))
await $`docker buildx build --platform=linux/amd64 -t chat .`

if ((await $`docker ps -a --format '{{.Names}}'`).stdout.includes('chat')) {
  await $`docker stop chat`
  await $`docker rm chat`
}
const e = Object.entries(c)
  .map(([k, v]) => `--env "${k}=${v}"`)
  .join(' ')
const cmd = `docker run ${e} -dp 8090:8080 --name chat chat`
console.log(cmd)
execSync(cmd)
// await $`docker run ${e} -dp 8090:8080 chat`
console.log(`run in http://localhost:8090`)
