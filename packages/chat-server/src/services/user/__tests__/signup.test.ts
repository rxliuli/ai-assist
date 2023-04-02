import { expect, it } from 'vitest'
import { active } from '../active'
import { signin } from '../signin'
import { signup } from '../signup'
import { Random } from 'mockjs'
import { TokenModel, UserModel } from '../../../constants/db'

it('should create a new user', async () => {
  const username = Random.name()
  const password = Random.string(8)
  const email = Random.email()
  // signup
  const signupR = await signup({ username, password, email }, 'http://localhost:5173')
  // active
  await active({ code: signupR.activeCode })
  // signin
  const token = await signin({
    usernameOrEmail: username,
    password,
  })
  // console.log(username, password, email, signupR, token)
  expect(token).not.undefined
  await expect(active({ code: signupR.activeCode })).rejects.toThrowError()
  // clean
  await TokenModel.destroy({ where: { accessToken: token.token } })
  await UserModel.destroy({ where: { username }, force: true })
})
