import { literal, Sequelize } from 'sequelize'
import { v4 } from 'uuid'
import { MessageModel, sequelize, Session, SessionModel } from '../../constants/db'
import { ServerError } from '../../util/ServerError'

export async function addSession(session: Pick<Session, 'name' | 'userId'>): Promise<Session> {
  const r = await SessionModel.create({
    ...session,
    id: v4(),
  })
  return r.get()
}

/**
 * 获取所有的 session
 * @param userId
 * @returns
 */
export async function listSession(userId: string): Promise<Session[]> {
  return (
    await SessionModel.findAll({
      where: {
        userId,
      },
      attributes: ['id', 'name'],
      order: [['created_at', 'DESC']],
    })
  ).map((it) => it.get())
}

/**
 * 删除特定用户的特定 session
 * @param session
 * @returns
 */
export async function deleteSession(session: Pick<Session, 'id' | 'userId'>): Promise<void> {
  const t = await sequelize.transaction()
  try {
    await MessageModel.destroy({
      where: {
        sessionId: session.id,
      },
    })
    await SessionModel.destroy({
      where: {
        id: session.id,
        userId: session.userId,
      },
    })
  } catch (err) {
    await t.rollback()
    throw err
  }
}

export async function updateSessionName(session: Pick<Session, 'id' | 'userId' | 'name'>): Promise<void> {
  const r = await SessionModel.findOne({
    where: {
      id: session.id,
      userId: session.userId,
    },
  })
  if (!r) {
    throw new ServerError('session not found', 'SESSION_NOT_FOUND')
  }
  await r.set('name', session.name).save()
}
