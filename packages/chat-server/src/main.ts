import Application from 'koa'
import cors from '@koa/cors'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import { translate, TranslateParams } from './services/translate'
import { ChatCompletionRequestMessage } from 'openai'
import { chat } from './services/chat'
import { logger } from './constants/logger'
import { chatStream } from './services/chat-stream'
import { Stream } from 'node:stream'

const app = new Application()
const router = new Router()
router.get('/ping', (ctx) => {
  ctx.body = 'pong'
})

router.post('/translate', async (ctx) => {
  const params = ctx.request.body as TranslateParams
  logger.info('translate params', params)
  const r = await translate(params)
  logger.info('translate result', params)
  ctx.body = r
})

router.post('/chat', async (ctx) => {
  const params = ctx.request.body as Array<ChatCompletionRequestMessage>
  console.log('chat params', params)
  logger.info('chat params', params)
  const r = await chat(params)
  logger.info('chat result', params)
  ctx.body = r
})
router.post('/chat-stream', async (ctx) => {
  const params = ctx.request.body as Array<ChatCompletionRequestMessage>
  const stream = chatStream(params)
  // 设置响应头
  ctx.set('Content-Type', 'application/octet-stream')
  ctx.set('Content-Disposition', 'attachment; filename="file.txt"')
  // 将可读流作为响应体
  ctx.body = stream
})

app.use(cors()).use(bodyParser()).use(router.routes())

app.listen(8080)

console.log('server: http://localhost:8080/')
