import { expect, it } from 'vitest'
import { chat } from '..'

it('chat', async () => {
  const r = await chat([
    {
      role: 'user',
      content: 'Hello, how are you?',
    },
  ])
  expect(r).toBeTypeOf('string')
})
