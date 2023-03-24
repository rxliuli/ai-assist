import { expect, it } from 'vitest'
import { getOpenAIApi } from '../chatgpt'
import { streamCompletion } from '@fortaine/openai/stream'

it('should work', async () => {
  const r = await getOpenAIApi().createChatCompletion({
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

type ChatCompletion = {
  id: string
  object: string
  created: number
  model: string
  choices: {
    delta: {
      content: string
    }
    index: number
    finish_reason: 'stop' | null
  }[]
}

it('stream', async () => {
  const completion = await getOpenAIApi().createChatCompletion(
    {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: '你是谁？',
        },
      ],
      stream: true,
    },
    {
      responseType: 'stream',
    },
  )

  const r: string[] = []
  for await (const message of streamCompletion(completion.data as any)) {
    const parsed = JSON.parse(message) as ChatCompletion
    if (parsed.choices[0].finish_reason === 'stop') {
      break
    }
    const text = parsed.choices[0].delta.content
    if ([undefined, '\n\n'].includes(text)) {
      continue
    }
    console.log(text)
    r.push(text)
  }
  console.log(r)
})
