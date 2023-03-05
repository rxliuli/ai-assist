import { expect, it } from 'vitest'
import { openai } from '../chatgpt'

it('should work', async () => {
  const r = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: '你知道魔法少女小圆么？',
      },
    ],
  })
  expect(r.data.choices[0].message?.content).not.undefined
})
