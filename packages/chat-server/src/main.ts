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
import { auth, getUserIdByToken } from './services/user/auth'
import { isEmpty, pick } from 'lodash-es'
import { signin, SignInInfo } from './services/user/signin'
import { signup, SignUpInfo } from './services/user/signup'
import { active, ActiveReq } from './services/user/active'
import { ServerError, serverErrorHandle } from './util/ServerError'
import { logout } from './services/user/logout'
import { addSession, deleteSession, listSession, updateSessionName } from './services/message/sessions'
import { addMessage, batchAddMessage, deleteMessage, listMessage } from './services/message/messages'
import { addPrompt, deletePrompt, getPromptById, listPromptByUserId, updatePrompt } from './services/prompt/prompt'
import { Message } from './constants/db'
import { ResetPasswordReq, resetPassword, sendResetPasswordEmail } from './services/user/reset'

const app = new Application()
const router = new Router()
router.get('/api/ping', (ctx) => {
  ctx.body = 'pong'
})

router.post('/api/chat', async (ctx) => {
  const params = ctx.request.body as Array<ChatCompletionRequestMessage>
  if (!Array.isArray(params)) {
    ctx.status = 400
    throw new ServerError('params is not array', 'PARAMS_NOT_ARRAY')
  }
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
router.post('/api/reset-password-sent', async (ctx) => {
  const reqInfo = ctx.request.body as {
    email: string
  }
  if (isEmpty(reqInfo.email)) {
    throw new ServerError('email is empty', 'EMAIL_EMPTY', 400)
  }
  await sendResetPasswordEmail(reqInfo.email, new URL(ctx.get('referer')).origin)
  ctx.body = 'ok'
})
router.post('/api/reset-password', async (ctx) => {
  const reqInfo = ctx.request.body as ResetPasswordReq
  if (isEmpty(reqInfo.code)) {
    throw new ServerError('code is empty', 'CODE_EMPTY', 400)
  }
  if (isEmpty(reqInfo.password)) {
    throw new ServerError('password is empty', 'PASSWORD_EMPTY', 400)
  }
  await resetPassword(reqInfo)
  ctx.body = 'ok'
})
router.post('/api/logout', async (ctx) => {
  const token = ctx.get('Authorization')
  await logout(token)
  ctx.status = 200
  ctx.body = 'logout success'
})
router.get('/api/session', async (ctx) => {
  const token = ctx.get('Authorization')
  const userId = await getUserIdByToken(token)
  if (!userId) {
    throw new ServerError('user not found', 'USER_NOT_FOUND')
  }
  ctx.body = await listSession(userId)
  ctx.status = 200
})
router.post('/api/session', async (ctx) => {
  const token = ctx.get('Authorization')
  const userId = await getUserIdByToken(token)
  if (!userId) {
    throw new ServerError('user not found', 'USER_NOT_FOUND')
  }
  const req = ctx.request.body as { name: string }
  if (!req.name) {
    throw new ServerError('name is empty', 'NAME_EMPTY')
  }
  ctx.body = await addSession({
    userId,
    name: req.name,
  })
})
router.put('/api/session/:id', async (ctx) => {
  const sessionId = ctx.params.id
  const reqBody = ctx.request.body as { name: string }
  if (!sessionId) {
    throw new ServerError('sessionId is empty', 'SESSION_ID_EMPTY')
  }
  if (!reqBody.name) {
    throw new ServerError('name is empty', 'NAME_EMPTY')
  }
  const userId = await getUserIdByToken(ctx.get('Authorization'))
  if (!userId) {
    throw new ServerError('user not found', 'USER_NOT_FOUND')
  }
  await updateSessionName({
    id: sessionId,
    userId,
    name: reqBody.name,
  })
  ctx.status = 200
})
router.delete('/api/session/:id', async (ctx) => {
  const userId = await getUserIdByToken(ctx.get('Authorization'))
  const sessionId = ctx.params.id
  if (!sessionId) {
    throw new ServerError('sessionId is empty', 'SESSION_ID_EMPTY')
  }
  if (!userId) {
    throw new ServerError('user not found', 'USER_NOT_FOUND')
  }
  await deleteSession({
    id: sessionId,
    userId,
  })
  ctx.status = 200
})
router.get('/api/message', async (ctx) => {
  const sessionId = new URLSearchParams(ctx.search).get('sessionId')
  if (!sessionId) {
    throw new ServerError('sessionId is empty', 'SESSION_ID_EMPTY')
  }
  const userId = await getUserIdByToken(ctx.get('Authorization'))
  if (!userId) {
    throw new ServerError('user not found', 'USER_NOT_FOUND')
  }
  ctx.body = await listMessage({
    id: sessionId,
    userId,
  })
})
router.post('/api/message/batch', async (ctx) => {
  const userId = await getUserIdByToken(ctx.get('Authorization'))
  if (!userId) {
    throw new ServerError('user not found', 'USER_NOT_FOUND')
  }
  const reqBody = ctx.request.body as { messages: Pick<Message, 'sessionId' | 'role' | 'content'>[] }
  if (!reqBody.messages) {
    throw new ServerError('messages is empty', 'MESSAGES_EMPTY')
  }
  await batchAddMessage(reqBody.messages, userId)
  ctx.status = 200
})
router.post('/api/message', async (ctx) => {
  const userId = await getUserIdByToken(ctx.get('Authorization'))
  if (!userId) {
    throw new ServerError('user not found', 'USER_NOT_FOUND')
  }
  const reqBody = ctx.request.body as { content: string; role: 'user' | 'assistant' | 'system'; sessionId: string }
  if (!reqBody.content) {
    throw new ServerError('content is empty', 'CONTENT_EMPTY')
  }
  if (!reqBody.role) {
    throw new ServerError('role is empty', 'ROLE_EMPTY')
  }
  if (!reqBody.sessionId) {
    throw new ServerError('sessionId is empty', 'SESSION_ID_EMPTY')
  }
  ctx.body = await addMessage({
    sessionId: reqBody.sessionId,
    content: reqBody.content,
    role: reqBody.role,
    userId,
  })
  ctx.status = 200
})

router.get('/api/prompt', async (ctx) => {
  const userId = await getUserIdByToken(ctx.get('Authorization'))
  if (!userId) {
    throw new ServerError('user not found', 'USER_NOT_FOUND')
  }
  ctx.body = await listPromptByUserId(userId)
})
router.post('/api/prompt', async (ctx) => {
  const userId = await getUserIdByToken(ctx.get('Authorization'))
  if (!userId) {
    throw new ServerError('user not found', 'USER_NOT_FOUND')
  }
  const reqBody = ctx.request.body as { name: string; content: string; prefix?: string }
  if (isEmpty(reqBody.name)) {
    throw new ServerError('name is empty', 'NAME_EMPTY')
  }
  if (isEmpty(reqBody.content)) {
    throw new ServerError('content is empty', 'CONTENT_EMPTY')
  }
  ctx.body = await addPrompt({
    userId,
    ...pick(reqBody, 'name', 'content', 'prefix'),
  })
  ctx.status = 200
})
router.put('/api/prompt/:id', async (ctx) => {
  const userId = await getUserIdByToken(ctx.get('Authorization'))
  if (!userId) {
    throw new ServerError('user not found', 'USER_NOT_FOUND')
  }
  const id = ctx.params.id
  if (!id) {
    throw new ServerError('id is empty', 'ID_EMPTY')
  }
  const reqBody = ctx.request.body as { name: string; content: string; prefix?: string }
  if (!isEmpty(reqBody.name)) {
    throw new ServerError('name is empty', 'NAME_EMPTY')
  }
  if (!isEmpty(reqBody.content)) {
    throw new ServerError('content is empty', 'CONTENT_EMPTY')
  }
  ctx.body = await updatePrompt({
    userId,
    id,
    ...pick(reqBody, 'name', 'content', 'prefix'),
  })
  ctx.status = 200
})
router.delete('/api/prompt/:id', async (ctx) => {
  const userId = await getUserIdByToken(ctx.get('Authorization'))
  if (!userId) {
    throw new ServerError('user not found', 'USER_NOT_FOUND')
  }
  const id = ctx.params.id
  if (!id) {
    throw new ServerError('id is empty', 'ID_EMPTY')
  }
  await deletePrompt({
    userId,
    id,
  })
  ctx.status = 200
})
router.get('/api/prompt/:id', async (ctx) => {
  const userId = await getUserIdByToken(ctx.get('Authorization'))
  if (!userId) {
    throw new ServerError('user not found', 'USER_NOT_FOUND')
  }
  const id = ctx.params.id
  if (!id) {
    throw new ServerError('id is empty', 'ID_EMPTY')
  }
  ctx.body = await getPromptById({
    userId,
    id,
  })
  ctx.status = 200
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
