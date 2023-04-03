import { pick } from 'lodash-es'
import { expect, it } from 'vitest'
import { addPrompt, deletePrompt, getPromptById, listPromptByUserId, updatePrompt } from '../prompt'

it('listPromptByUserId', async () => {
  const addResult = await addPrompt({
    name: 'test',
    content: 'test',
    prefix: 'test',
    userId: process.env.TEST_USER_ID!,
  })
  const r2 = await listPromptByUserId(process.env.TEST_USER_ID!)
  expect(r2.some((it) => it.id === addResult.id)).true
  const r3 = await getPromptById({ id: addResult.id, userId: process.env.TEST_USER_ID! })
  expect(r3!.name).eq(addResult.name)
  await updatePrompt({
    id: addResult.id,
    name: 'test2',
    content: 'test2',
    prefix: 'test2',
    userId: process.env.TEST_USER_ID!,
  })
  expect(
    pick(await getPromptById({ id: addResult.id, userId: process.env.TEST_USER_ID! })!, 'name', 'content', 'prefix'),
  ).deep.eq({ name: 'test2', content: 'test2', prefix: 'test2' })
  await deletePrompt({ id: addResult.id, userId: process.env.TEST_USER_ID! })
  expect(await getPromptById({ id: addResult.id, userId: process.env.TEST_USER_ID! })).undefined
})
