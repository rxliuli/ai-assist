import { Middleware } from 'koa'
import { TokenModel, User } from '../../constants/db'
import bcrypt from 'bcrypt'
import { v4 } from 'uuid'
import dayjs from 'dayjs'
import LRUCache from 'lru-cache'
import { logger } from '../../constants/logger'

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

const tokenCache = new LRUCache<string, { userId: string; expirationTime: Date }>({
  max: 1000, // 缓存最大条目数，根据实际需求调整
  ttl: 1000 * 60 * 60, // 缓存有效期，单位：毫秒，这里设置为 1 小时
  updateAgeOnGet: false,
  updateAgeOnHas: false,
})

const tokenUpdateThreshold = 7 // 设置 token 更新阈值，单位：天
const tokenExpiratDays = 30

export async function validateToken(token: string): Promise<boolean> {
  let r = tokenCache.get(token)
  if (!r) {
    const tokenModel = await TokenModel.findOne({
      where: { accessToken: token },
    })
    if (!tokenModel) {
      return false
    }
    r = tokenModel.get()
    tokenCache.set(token, r)
  }
  if (dayjs(r.expirationTime).isBefore(dayjs())) {
    return false
  }
  // 检查 token 是否接近过期，如果是，则更新数据库中的过期时间
  const daysToExpiration = dayjs(r.expirationTime).diff(dayjs(), 'day')
  if (daysToExpiration < tokenUpdateThreshold) {
    await TokenModel.update(
      { expirationTime: dayjs().add(tokenExpiratDays, 'day').toDate() },
      { where: { accessToken: token } },
    )
  }
  return true
}

export async function revokeToken(token: string): Promise<void> {
  tokenCache.delete(token)
  await TokenModel.destroy({
    where: { accessToken: token },
  })
}

export async function getUserIdByToken(token: string): Promise<string | undefined> {
  let r = tokenCache.get(token)
  if (!r) {
    const tokenModel = await TokenModel.findOne({
      where: { accessToken: token },
    })
    if (!tokenModel) {
      return
    }
    r = tokenModel.get()
    tokenCache.set(token, r)
  }
  return r.userId
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
