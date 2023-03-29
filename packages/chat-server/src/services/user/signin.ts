import { Op } from 'sequelize'
import { UserModel } from '../../constants/db'
import bcrypt from 'bcrypt'
import { generateToken } from './auth'

export interface SignInInfo {
  usernameOrEmail: string
  password: string
}

export async function signin(loginInfo: SignInInfo): Promise<{
  token: string
}> {
  const r = (
    await UserModel.findOne({
      where: {
        [Op.or]: [{ username: loginInfo.usernameOrEmail }, { email: loginInfo.usernameOrEmail }],
      },
    })
  )?.get()
  if (!r) {
    throw new Error('No such user')
  }
  const hashPassword = bcrypt.hashSync(loginInfo.password, r.passwordSalt)
  if (r.passwordHash !== hashPassword) {
    throw new Error('Username or password is incorrect')
  }
  if (r.disabled) {
    throw new Error('User is disabled')
  }
  const token = await generateToken(r)
  return {
    token,
  }
}
