import { v4 } from 'uuid'
import { expect, it } from 'vitest'
import { addMessage, deleteMessage, listMessage } from '../messages'
import { addSession } from '../sessions'

it.skip('listMessage', async () => {
  const r = await listMessage({
    id: v4(),
    userId: process.env.TEST_USER_ID!,
  })
  console.log(r)
})

it.skip('basic', async () => {
  const addSessionResult = await addSession({ userId: process.env.TEST_USER_ID!, name: 'test' })
  const addResult = await addMessage({
    sessionId: addSessionResult.id,
    role: 'user',
    content: 'test',
    userId: process.env.TEST_USER_ID!,
  })
  expect((await listMessage({ id: addSessionResult.id, userId: process.env.TEST_USER_ID! })).length).eq(1)
  await deleteMessage({
    id: addResult.id,
    userId: process.env.TEST_USER_ID!,
  })
  expect((await listMessage({ id: addSessionResult.id, userId: process.env.TEST_USER_ID! })).length).eq(0)
})
