import { Middleware } from 'koa'
import { getUserIdByToken } from '../user/auth'
import { ServerError } from '../../util/ServerError'
import { UserModel } from '../../constants/db'

const validated = new Set<string>()

export function adminAuth(): Middleware {
  return async (ctx, next) => {
    const token = ctx.get('Authorization')
    const id = await getUserIdByToken(token)
    if (!id) {
      throw new ServerError('TOKEN_INVALID', 'token invalid')
    }
    if (validated.has(id)) {
      return next()
    }
    const user = await UserModel.findByPk(id)
    if (!user) {
      throw new ServerError('USER_NOT_FOUND', 'user not found')
    }
    if (user.get().username !== process.env.ADMIN_USERNAME) {
      throw new ServerError('USER_NOT_ADMIN', 'user not admin')
    }
    return next()
  }
}
