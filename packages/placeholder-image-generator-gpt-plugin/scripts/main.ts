import { $, path, fs } from 'zx'
import { parse } from 'dotenv'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { pick } from 'lodash-es'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const c = parse(await fs.readFile(path.resolve(__dirname, '../.env'), 'utf-8'))

const name = 'placeholder-image-generator-gpt-plugin'

await $`pnpm build`
const json = await fs.readJson(path.resolve(__dirname, '../package.json'))
await fs.writeJson(
  path.resolve(__dirname, '../dist/package.json'),
  pick(json, ['name', 'version', 'type', 'dependencies', 'scripts']),
  {
    spaces: 2,
  },
)

await $`docker buildx build --platform=linux/amd64 -t ${name} .`

if ((await $`docker ps -a --format '{{.Names}}'`).stdout.includes(name)) {
  await $`docker stop ${name}`
  await $`docker rm ${name}`
}
const e = Object.entries(c)
  .map(([k, v]) => `--env "${k}=${v}"`)
  .join(' ')
const cmd = `docker run ${e} -dp 8090:8080 --name ${name} ${name}`
console.log(cmd)
execSync(cmd)
// await $`docker run ${e} -dp 8090:8080 ${name}`
console.log(`run in http://localhost:8090`)
