import { Op } from 'sequelize'
import { UserModel } from '../../constants/db'
import bcrypt from 'bcrypt'
import { generateToken } from './auth'
import { ServerError } from '../../util/ServerError'
import { sendActiveEmail } from './signup'

export interface SignInInfo {
  usernameOrEmail: string
  password: string
}

export async function signin(
  loginInfo: SignInInfo,
  origin: string,
): Promise<{
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
    throw new ServerError('No such user', 'NO_SUCH_USER')
  }
  const hashPassword = bcrypt.hashSync(loginInfo.password, r.passwordSalt)
  if (r.disabled) {
    throw new ServerError('User is disabled', 'USER_DISABLED')
  }
  if (!r.emailVerified) {
    await sendActiveEmail(r, origin)
    throw new ServerError('Email not verified', 'EMAIL_NOT_VERIFIED')
  }
  if (r.passwordHash !== hashPassword) {
    throw new ServerError('Username or password is incorrect', 'USERNAME_OR_PASSWORD_INCORRECT')
  }
  const token = await generateToken(r)
  return {
    token,
  }
}
