import sequelize, { Op, WhereOptions } from 'sequelize'
import { MessageModel, SessionModel, UserModel } from '../../constants/db'
import { Message } from '../../constants/db'

export async function listMessage(args: {
  offset: number
  limit: number
  keyword?: string
  userId?: string
  start?: Date
  end?: Date
  sessionId?: string
}) {
  const wheres: WhereOptions<Message> = []
  if (args.keyword) {
    const keyword = `%${args.keyword}%`
    wheres.push({
      [Op.or]: [
        {
          content: {
            [Op.like]: keyword,
          },
        },
        sequelize.where(sequelize.col('user.username'), {
          [Op.like]: keyword,
        }),
        sequelize.where(sequelize.col('session.name'), {
          [Op.like]: keyword,
        }),
      ],
    })
  }
  if (args.start && args.end) {
    wheres.push({
      createdAt: {
        [Op.between]: [args.start, args.end],
      },
    })
  }
  return MessageModel.findAndCountAll({
    ...args,
    attributes: ['id', 'sessionId', 'userId', 'role', 'content', 'createdAt'],
    include: [
      {
        model: UserModel,
        attributes: ['username'], // 这里假设你想要查询的是用户的用户名
      },
      {
        model: SessionModel,
        attributes: ['name'], // 这里假设你想要查询的是会话的名字
      },
    ],
    where:
      wheres.length === 0
        ? undefined
        : {
            [Op.and]: wheres,
          },
    order: [['createdAt', 'DESC']],
  })
}

export const messages = {
  listMessage,
}
