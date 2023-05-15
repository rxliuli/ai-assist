import { expect, it } from 'vitest'
import { chatStream } from '../chatStream'

it('chatStream', async () => {
  const s = chatStream({
    messages: [{ role: 'user', content: '你是谁？' }],
    apiKey: process.env.OPENAI_API_KEY!,
    userId: 'rxliuli',
  })
  const r: string[] = []
  s.on('data', (chunk) => {
    r.push(chunk.toString())
  })
  await new Promise((resolve) => s.on('end', resolve))
  console.log(r)
  expect(r).not.empty
})
