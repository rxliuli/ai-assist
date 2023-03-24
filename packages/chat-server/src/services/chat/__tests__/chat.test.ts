import { expect, it } from 'vitest'
import { chat } from '..'

it('chat', async () => {
  const r = await chat(
    [
      {
        role: 'user',
        content: 'Hello, how are you?',
      },
    ],
    process.env.OPENAI_API_KEY!,
  )
  console.log(r)
  expect(r).toBeTypeOf('string')
})
