import bcrypt from 'bcrypt'
import { v4 } from 'uuid'
import { User, UserModel } from '../../constants/db'
import { SaltRounds } from './auth'

export interface SignUpInfo {
  username: string
  password: string
  email: string
}

export async function signup(signupInfo: SignUpInfo): Promise<void> {
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
  }
  await UserModel.create(user)
}
