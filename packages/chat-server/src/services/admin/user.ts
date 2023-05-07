import { UserModel } from '../../constants/db'

export function listUser(args: { offset: number; limit: number }) {
  return UserModel.findAndCountAll({
    ...args,
    attributes: ['id', 'username', 'email', 'created_at', 'email_verified', 'disabled'],
  })
}
