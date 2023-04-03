import { v4 } from 'uuid'
import { Message, MessageModel, Session } from '../../constants/db'

export async function listMessage(session: Pick<Session, 'id' | 'userId'>) {
  return (
    await MessageModel.findAll({
      where: {
        sessionId: session.id,
      },
      order: [['created_at', 'DESC']],
    })
  ).map((it) => it.get())
}

export async function addMessage(
  message: Pick<Message, 'sessionId' | 'role' | 'content' | 'userId'>,
): Promise<Message> {
  const r = await MessageModel.create({
    ...message,
    id: v4(),
  })
  return r.get()
}

export async function deleteMessage(
  message: Pick<Message, 'id'> & {
    userId: string
  },
) {
  await MessageModel.destroy({
    where: {
      id: message.id,
      userId: message.userId,
    },
  })
}

export async function batchAddMessage(messages: Pick<Message, 'sessionId' | 'role' | 'content'>[], userId: string) {
  await MessageModel.bulkCreate(
    messages.map((it) => ({
      ...it,
      userId,
      id: v4(),
    })),
  )
}
