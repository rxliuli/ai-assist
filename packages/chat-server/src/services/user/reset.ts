import LRUCache from 'lru-cache'
import { v4 } from 'uuid'
import { sendEmail } from '../../util/email'
import { UserModel } from '../../constants/db'
import { logger } from '../../constants/logger'
import { ServerError } from '../../util/ServerError'
import bcrypt from 'bcrypt'
import { SaltRounds } from './auth'

const resetCodeCache = new LRUCache<string, { email: string }>({
  max: 1000, // 缓存最大条目数，根据实际需求调整
  ttl: 1000 * 60 * 5, // 缓存有效期，单位：毫秒，这里设置为 1 小时
  updateAgeOnGet: false,
  updateAgeOnHas: false,
})

export async function sendResetPasswordEmail(email: string, origin: string) {
  const code = v4()
  // find user
  const user = await UserModel.findOne({
    where: { email },
  })
  if (!user) {
    logger.info(`sendResetPasswordEmail User not found: ${email}`)
    return
  }
  if (user.get().disabled) {
    throw new ServerError('User is disabled', 'USER_DISABLED')
  }
  if (!user.get().emailVerified) {
    throw new ServerError('Email not verified', 'EMAIL_NOT_VERIFIED')
  }
  // async send email
  const activeLink = origin + '/#/reset-password?' + new URLSearchParams([['code', code]]).toString()
  logger.info(`sendResetPasswordEmail: ${email} ${activeLink}`)
  if (process.env.NODE_ENV !== 'development') {
    sendEmail({
      to: email,
      subject: 'Chat App - Reset Password',
      html: `Please click the link below to reset your password: <a href="${activeLink}">${activeLink}</a>`,
    })
  }
  resetCodeCache.set(code, { email })
}

export interface ResetPasswordReq {
  code: string
  password: string
}

export async function resetPassword({ password, code }: ResetPasswordReq) {
  const cache = resetCodeCache.get(code)
  if (!cache) {
    throw new ServerError('Invalid code', 'INVALID_CODE')
  }
  // find user
  const user = await UserModel.findOne({
    where: { email: cache.email },
  })
  if (!user) {
    throw new ServerError('User not found', 'USER_NOT_FOUND')
  }
  // 生成随机盐值
  const salt = bcrypt.genSaltSync(SaltRounds)
  // 对密码进行加盐哈希处理
  const hash = bcrypt.hashSync(password, salt)
  await user.update({
    passwordHash: hash,
    passwordSalt: salt,
  })
  resetCodeCache.delete(code)
}
