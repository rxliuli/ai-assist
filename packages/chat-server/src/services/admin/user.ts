import { Op, WhereOptions } from 'sequelize'
import { User, UserModel } from '../../constants/db'

export function listUser(args: {
  offset: number
  limit: number
  keyword: string
  emailVerified?: boolean
  disabled?: boolean
}) {
  const wheres: WhereOptions<User> = [
    {
      [Op.or]: [
        {
          username: {
            [Op.like]: `%${args.keyword}%`,
          },
        },
        {
          email: {
            [Op.like]: `%${args.keyword}%`,
          },
        },
      ],
    },
  ]
  // console.log('args', args)
  if (args.emailVerified !== undefined) {
    wheres.push({
      emailVerified: args.emailVerified,
    })
  }
  if (args.disabled !== undefined) {
    wheres.push({
      disabled: args.disabled,
    })
  }
  return UserModel.findAndCountAll({
    ...args,
    attributes: [
      'id',
      'username',
      'email',
      ['created_at', 'createdAt'],
      ['email_verified', 'emailVerified'],
      'disabled',
    ],
    where: {
      [Op.and]: wheres,
    },
    order: [['createdAt', 'DESC']],
  })
}

export function switchUserEmailValidate(id: string, emailVerified: boolean) {
  return UserModel.update({ emailVerified }, { where: { id } })
}

export function switchUserDisabled(id: string, disabled: boolean) {
  return UserModel.update({ disabled }, { where: { id } })
}
