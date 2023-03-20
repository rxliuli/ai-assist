import { expect, it } from 'vitest'
import { EventEmitter } from 'eventemitter3'

it('streamResp', async () => {
  const resp = await fetch(process.env.SERVER_URL + '/api/test/stream', { method: 'post' })
  const reader = resp.body!.getReader()
  let chunk = await reader.read()
  const textDecoder = new TextDecoder()
  const r: any[] = []
  while (!chunk.done) {
    const s = textDecoder
      .decode(chunk.value)
      .split('\n')
      .filter((it) => it.trim().length > 0)
      .map((it) => JSON.parse(it))
    if (s[s.length - 1].action === 'end') {
      r.push(...s.slice(0, s.length - 1))
      break
    }
    r.push(...s)
    chunk = await reader.read()
  }
  expect(r.length).eq(10)
  expect(r.every((it) => it.action && it.content)).true
})

function streamFetchResp(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const em = new EventEmitter<{
    data: (data: { action: 'message' | 'end'; content?: string }[]) => void
    error: (err: unknown) => void
    end: () => void
  }>()
  ;(async () => {
    try {
      let chunk = await reader.read()
      const textDecoder = new TextDecoder()
      while (!chunk.done) {
        const s = textDecoder
          .decode(chunk.value)
          .split('\n')
          .filter((it) => it.trim().length > 0)
          .map((it) => JSON.parse(it))
        if (s[s.length - 1].action === 'end') {
          em.emit('data', s.slice(0, s.length - 1))
          break
        }
        em.emit('data', s)
        chunk = await reader.read()
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        em.emit('error', e)
      }
    } finally {
      em.emit('end')
    }
  })()
  return em
}

it('streamFetchResp', async () => {
  const resp = await fetch(process.env.SERVER_URL + '/api/test/stream', { method: 'post' })
  const reader = resp.body!.getReader()
  const r: any[] = []
  await new Promise<void>((resolve, reject) =>
    streamFetchResp(reader)
      .on('data', (s) => r.push(...s))
      .on('end', resolve)
      .on('error', reject),
  )
  expect(r.length).eq(10)
  expect(r.every((it) => it.action && it.content)).true
})

it.only('manual stop', async () => {
  const c = new AbortController()
  const resp = await fetch(process.env.SERVER_URL + '/api/test/stream', { method: 'post', signal: c.signal })
  const reader = resp.body!.getReader()
  const r: any[] = []
  setTimeout(() => {
    c.abort()
  }, 500)
  await new Promise<void>((resolve, reject) =>
    streamFetchResp(reader)
      .on('data', (s) => r.push(...s))
      .on('end', resolve)
      .on('error', reject),
  )
  expect(r).not.empty
})
