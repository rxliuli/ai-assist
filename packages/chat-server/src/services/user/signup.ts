import bcrypt from 'bcrypt'
import dayjs from 'dayjs'
import { v4 } from 'uuid'
import { User, UserModel } from '../../constants/db'
import { logger } from '../../constants/logger'
import { SaltRounds } from './auth'
import { Op } from 'sequelize'
import { ServerError } from '../../util/ServerError'
import validator from 'validator'
import { sendEmail } from '../../util/email'

export interface SignUpInfo {
  username: string
  password: string
  email: string
}

export const activeCodeMap = new Map<
  string,
  {
    userId: string
    timestamp: number
  }
>()

export async function sendActiveEmail(user: User, origin: string) {
  const activeCode = bcrypt.hashSync(user.id, user.passwordSalt)
  activeCodeMap.set(activeCode, { userId: user.id, timestamp: dayjs().add(5, 'minute').valueOf() })
  const activeLink = origin + '/#/active?' + new URLSearchParams([['activeCode', activeCode]]).toString()
  logger.info('active link: ' + activeLink)
  // async send email
  sendEmail({
    to: user.email,
    subject: 'Chat App - Active Account',
    html: `Please click the link below to active your account: <a href="${activeLink}">${activeLink}</a>`,
  })
  return activeCode
}

export async function signup(signupInfo: SignUpInfo, origin: string): Promise<{ activeCode: string }> {
  // 检查用户名是否已经存在
  const r = await UserModel.findOne({
    where: {
      [Op.or]: [{ username: signupInfo.username }, { email: signupInfo.email }],
    },
  })
  if (r) {
    if (!r.get().emailVerified) {
      throw new ServerError('Email not verified', 'EMAIL_NOT_VERIFIED')
    }
    throw new ServerError('User already exists', 'USER_ALREADY_EXISTS')
  }
  // 使用 validator.js 验证邮箱、用户名和密码
  if (!validator.isEmail(signupInfo.email)) {
    throw new ServerError('Invalid email', 'INVALID_EMAIL')
  }
  if (!validator.isLength(signupInfo.username, { min: 6, max: 20 })) {
    throw new ServerError('Invalid username', 'INVALID_USERNAME')
  }
  if (!validator.isStrongPassword(signupInfo.password, { minLength: 8 })) {
    throw new ServerError('Invalid password', 'INVALID_PASSWORD')
  }
  // 生成随机盐值
  const salt = bcrypt.genSaltSync(SaltRounds)
  // 对密码进行加盐哈希处理
  const hash = bcrypt.hashSync(signupInfo.password, salt)
  // 将哈希值和盐值字符串存储到数据库中
  const user: User = {
    id: v4(),
    email: signupInfo.email,
    username: signupInfo.username,
    passwordHash: hash,
    passwordSalt: salt,
    emailVerified: false,
    disabled: false,
  }
  await UserModel.create(user)
  const activeCode = await sendActiveEmail(user, origin)
  return { activeCode }
}
