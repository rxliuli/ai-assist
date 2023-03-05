import { it } from 'vitest'
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
  console.log(r.statusText)
}, 10_000)
