import Application from 'koa'
import cors from '@koa/cors'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import { translate, TranslateParams } from './services/translate'
import { ChatCompletionRequestMessage } from 'openai'
import { chat } from './services/chat'
import { httpLogger, logger } from './constants/logger'
import { chatStream } from './services/chat-stream'
import { getRegionAndToken } from './services/speak'
import serve from 'koa-static'
import path from 'path'
import mount from 'koa-mount'
import { fileURLToPath } from 'url'
import { streamResp } from './services/test/streamResp'

const app = new Application()
const router = new Router()
router.get('/api/ping', (ctx) => {
  ctx.body = 'pong'
})

router.post('/api/translate', async (ctx) => {
  const params = ctx.request.body as TranslateParams
  const r = await translate(params)
  ctx.body = r
})

router.post('/api/chat', async (ctx) => {
  const params = ctx.request.body as Array<ChatCompletionRequestMessage>
  const r = await chat(params, ctx.get('OPENAI_API_KEY'))
  ctx.body = r
})
router.post('/api/chat-stream', async (ctx) => {
  const params = ctx.request.body as Array<ChatCompletionRequestMessage>
  const stream = chatStream(params, ctx.get('OPENAI_API_KEY'))
  // 设置响应头
  ctx.set('Content-Type', 'application/octet-stream')
  ctx.set('Content-Disposition', 'attachment; filename="file.txt"')
  // 将可读流作为响应体
  ctx.body = stream
})
router.get('/api/get-region-and-token', async (ctx) => {
  const r = await getRegionAndToken()
  logger.info('getRegionAndToken result', JSON.stringify(r))
  ctx.body = r
})

if (process.env.NODE_ENV === 'development') {
  router.post('/api/test/stream', async (ctx) => {
    const stream = streamResp()
    ctx.set('Content-Type', 'application/octet-stream')
    ctx.set('Content-Disposition', 'attachment; filename="file.txt"')
    ctx.body = stream
  })
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

app
  .use(httpLogger())
  .use(cors())
  .use(bodyParser())
  .use(router.routes())
  .use(mount('/', serve(path.resolve(__dirname, 'public'))))

app.listen(8080)

console.log('server: http://localhost:8080/')
