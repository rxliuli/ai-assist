import { expect, it } from 'vitest'
import { chatStream } from '..'

it('chatStream', async () => {
  const s = chatStream([{ role: 'user', content: '你是谁？' }], process.env.OPENAI_API_KEY!, 'rxliuli')
  const r: string[] = []
  s.on('data', (chunk) => {
    r.push(chunk.toString())
  })
  await new Promise((resolve) => s.on('end', resolve))
  console.log(r)
  expect(r).not.empty
})
