import Application from 'koa'
import cors from '@koa/cors'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import { translate, TranslateParams } from './services/translate'
import { ChatCompletionRequestMessage } from 'openai'
import { chat } from './services/chat'
import { logger } from './constants/logger'
import { chatStream } from './services/chat-stream'
import { getRegionAndToken } from './services/speak'
import serve from 'koa-static'
import path from 'path'
import mount from 'koa-mount'
import { fileURLToPath } from 'url'

const app = new Application()
const router = new Router()
router.get('/api/ping', (ctx) => {
  ctx.body = 'pong'
})

router.post('/api/translate', async (ctx) => {
  const params = ctx.request.body as TranslateParams
  logger.info('translate params', JSON.stringify(params))
  const r = await translate(params)
  logger.info('translate result', r)
  ctx.body = r
})

router.post('/api/chat', async (ctx) => {
  const params = ctx.request.body as Array<ChatCompletionRequestMessage>
  logger.info('chat params', JSON.stringify(params))
  const r = await chat(params)
  logger.info('chat result', r)
  ctx.body = r
})
router.post('/api/chat-stream', async (ctx) => {
  const params = ctx.request.body as Array<ChatCompletionRequestMessage>
  logger.info('chat params', JSON.stringify(params))
  const stream = chatStream(params)
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

const __dirname = path.dirname(fileURLToPath(import.meta.url))

app
  .use(cors())
  .use(bodyParser())
  .use(router.routes())
  .use(mount('/', serve(path.resolve(__dirname, 'public'))))

app.listen(8080)

console.log('server: http://localhost:8080/')
