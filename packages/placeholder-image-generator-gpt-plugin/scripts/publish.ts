import { $, path, fs } from 'zx'
import { fileURLToPath } from 'url'
import { pick } from 'lodash-es'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

await $`docker tag ${name} rxliuli/${name}:${json.version}`
await $`docker push rxliuli/${name}:${json.version}`
await $`docker tag ${name} rxliuli/${name}:latest`
await $`docker push rxliuli/${name}:latest`
