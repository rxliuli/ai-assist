import { $, fs, path } from 'zx'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, '.temp/db')
await fs.mkdirp(dbPath)
if ((await $`docker ps -a --format '{{.Names}}'`).stdout.includes('chat-db')) {
  await $`docker stop chat-db`
  await $`docker rm chat-db`
}
await $`docker run --name chat-db -v ${dbPath}:/var/lib/postgresql/data -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgrespw -dp 5432:5432 postgres:14`
