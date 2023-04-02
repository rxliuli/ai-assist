import Application from 'koa'
import cors from '@koa/cors'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
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
import { auth } from './services/user/auth'
import { isEmpty } from 'lodash-es'
import { signin, SignInInfo } from './services/user/signin'
import { signup, SignUpInfo } from './services/user/signup'
import { active, ActiveReq } from './services/user/active'
import { serverErrorHandle } from './util/ServerError'
import { logout } from './services/user/logout'

const app = new Application()
const router = new Router()
router.get('/api/ping', (ctx) => {
  ctx.body = 'pong'
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
router.post('/api/signin', async (ctx) => {
  const loginInfo = ctx.request.body as SignInInfo
  if (isEmpty(loginInfo.usernameOrEmail) || isEmpty(loginInfo.password)) {
    ctx.status = 400
    ctx.body = 'usernameOrEmail or password is empty'
    return
  }
  ctx.body = await signin(loginInfo, new URL(ctx.get('referer')).origin)
})
router.post('/api/signup', async (ctx) => {
  const user = ctx.request.body as SignUpInfo
  if (isEmpty(user.email) || isEmpty(user.username) || isEmpty(user.password)) {
    ctx.status = 400
    ctx.body = 'usernameOrEmail or password is empty'
    return
  }
  await signup(user, new URL(ctx.get('referer')).origin)
  ctx.body = 'ok'
})
router.post('/api/active', async (ctx) => {
  const activeInfo = ctx.request.body as ActiveReq
  if (isEmpty(activeInfo.code)) {
    ctx.status = 400
    ctx.body = 'code is empty'
    return
  }
  await active(activeInfo)
  ctx.body = 'ok'
})
router.post('/api/logout', async (ctx) => {
  const token = ctx.get('Authorization')
  await logout(token)
  ctx.status = 200
  ctx.body = 'logout success'
})

if (process.env.NODE_ENV === 'development') {
  router.post('/api/test/stream', async (ctx) => {
    const stream = streamResp()
    ctx.set('Content-Type', 'application/octet-stream')
    ctx.set('Content-Disposition', 'attachment; filename="file.txt"')
    ctx.body = stream
  })
  router.post('/api/test-body', async (ctx) => {
    console.log('body', ctx.request)
    ctx.body = ctx.request.body
  })
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

app
  .use(httpLogger())
  .use(cors())
  .use(serverErrorHandle())
  .use(bodyParser())
  .use(mount('/api', auth()))
  .use(router.routes())
  .use(mount('/', serve(path.resolve(__dirname, 'public'))))

app.listen(8080)

console.log('server: http://localhost:8080/')
