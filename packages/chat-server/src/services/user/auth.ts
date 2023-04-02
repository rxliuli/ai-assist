import { Middleware } from 'koa'
import { TokenModel, User } from '../../constants/db'
import bcrypt from 'bcrypt'
import { v4 } from 'uuid'
import dayjs from 'dayjs'

export const SaltRounds = 10

export async function generateToken(user: User): Promise<string> {
  const token = bcrypt.hashSync(user.username, bcrypt.genSaltSync(SaltRounds))
  await TokenModel.create({
    id: v4(),
    userId: user.id,
    accessToken: token,
    expirationTime: dayjs().add(30, 'day').toDate(),
  })
  return token
}

export async function validateToken(token: string): Promise<boolean> {
  const r = await TokenModel.findOne({
    where: { accessToken: token },
  })
  if (!r) {
    return false
  }
  if (dayjs(r.get().expirationTime).isBefore(dayjs())) {
    return false
  }
  await r.set('expirationTime', dayjs().add(30, 'day').toDate()).save()
  return true
}

export async function revokeToken(token: string): Promise<void> {
  await TokenModel.destroy({
    where: { accessToken: token },
  })
}

export function auth(): Middleware {
  return async (ctx, next) => {
    if (['/signin', '/signup', '/active'].includes(ctx.path)) {
      return next()
    }
    const token = ctx.get('Authorization')
    if (!token) {
      ctx.status = 401
      ctx.body = 'Unauthorized'
      return
    }
    if (!(await validateToken(token))) {
      ctx.status = 401
      ctx.body = 'Unauthorized'
      return
    }
    await next()
  }
}
