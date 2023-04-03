import { expect, it } from 'vitest'
import { addSession, deleteSession, listSession, updateSessionName } from '../sessions'

it.skip('listSession', async () => {
  const r = await listSession(process.env.TEST_USER_ID!)
  console.log(r)
})

it.skip('basic', async () => {
  const addResult = await addSession({ userId: process.env.TEST_USER_ID!, name: 'test' })
  expect((await listSession(process.env.TEST_USER_ID!)).some((it) => it.id === addResult.id)).true
  await updateSessionName({ id: addResult.id, userId: process.env.TEST_USER_ID!, name: 'test2' })
  expect((await listSession(process.env.TEST_USER_ID!)).find((it) => it.id === addResult.id)!.name).eq('test2')
  await deleteSession({ id: addResult.id, userId: process.env.TEST_USER_ID! })
  expect((await listSession(process.env.TEST_USER_ID!)).some((it) => it.id === addResult.id)).false
})
