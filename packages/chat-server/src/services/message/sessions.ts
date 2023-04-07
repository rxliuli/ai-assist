import { v4 } from 'uuid'
import { Message, MessageModel, sequelize, Session, SessionModel } from '../../constants/db'
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
      attributes: ['id', 'name', 'created_at'],
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
      transaction: t,
    })
    await SessionModel.destroy({
      where: {
        id: session.id,
        userId: session.userId,
      },
      transaction: t,
    })
    await t.commit()
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

export type BatchImportSessionReq = Pick<Session, 'name' | 'createdAt'> & {
  messages: Pick<Message, 'content' | 'role' | 'createdAt'>[]
}
export async function batchImportSession(session: BatchImportSessionReq, userId: string) {
  const t = await sequelize.transaction()
  try {
    const sessionId = v4()
    await SessionModel.create(
      {
        ...session,
        userId,
        id: sessionId,
        updatedAt: session.createdAt,
      },
      { transaction: t },
    )
    await MessageModel.bulkCreate(
      session.messages.map((it) => ({
        ...it,
        id: v4(),
        sessionId,
        userId,
        updatedAt: it.createdAt,
      })),
      { transaction: t },
    )
    await t.commit()
  } catch (err) {
    await t.rollback()
    throw err
  }
}
