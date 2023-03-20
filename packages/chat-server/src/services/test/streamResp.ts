import { Stream } from 'node:stream'

export function streamResp() {
  const stream = new Stream.Readable({
    read(size) {},
  })
  ;(async () => {
    const arr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100))
    for (const v of arr) {
      console.log('v', v)
      await new Promise((resolve) => setTimeout(resolve, 100))
      stream.push(
        JSON.stringify({
          action: 'message',
          content: v,
        }) + '\n',
      )
    }
    stream.push(
      JSON.stringify({
        action: 'end',
      }) + '\n',
    )
    stream.push(null)
  })()
  return stream
}
