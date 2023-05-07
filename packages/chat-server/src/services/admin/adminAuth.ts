import { Middleware } from 'koa'
import { getUserIdByToken } from '../user/auth'
import { ServerError } from '../../util/ServerError'
import { UserModel } from '../../constants/db'
import { SignInInfo } from '../user/signin'
import { signin } from '../user/signin'

const validated = new Set<string>()

async function validateAdminToken(token: string) {
  const id = await getUserIdByToken(token)
  if (!id) {
    throw new ServerError('TOKEN_INVALID', 'token invalid')
  }
  if (validated.has(id)) {
    return
  }
  const user = await UserModel.findByPk(id, {
    attributes: ['username'],
  })
  if (!user) {
    throw new ServerError('user not found', 'USER_NOT_FOUND')
  }
  if (user.get().username !== process.env.ADMIN_USERNAME) {
    throw new ServerError('user not admin', 'USER_NOT_ADMIN')
  }
  validated.add(id)
}

export function adminAuth(): Middleware {
  return async (ctx, next) => {
    if (['/signin'].includes(ctx.path)) {
      console.log('adminAuth', ctx.path)
      return next()
    }
    try {
      await validateAdminToken(ctx.get('Authorization'))
    } catch (err) {
      ctx.body = {
        code: (err as ServerError).code,
        message: (err as ServerError).message,
      }
      ctx.status = 401
      return
    }
    return next()
  }
}

export async function adminSignIn(loginInfo: SignInInfo) {
  const token = (await signin(loginInfo)).token
  await validateAdminToken(token)
  return {
    token,
  }
}
