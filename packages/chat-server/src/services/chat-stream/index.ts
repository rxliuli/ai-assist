import { ChatCompletionRequestMessage } from 'openai'
import { openai } from '../../constants/chatgpt'
import { streamCompletion } from '@fortaine/openai/stream'
import { PassThrough, Stream } from 'stream'

interface ChatCompletion {
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

/**
 * 流式返回聊天内容
 * @param messages
 * @returns
 */
export function chatStream(messages: Array<ChatCompletionRequestMessage>) {
  const stream = new Stream.Readable({
    read(size) {
      // do nothing
    },
  })
  ;(async () => {
    const completion = await openai.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        messages,
        stream: true,
      },
      {
        responseType: 'stream',
      },
    )
    for await (const message of streamCompletion(completion.data as any)) {
      const parsed = JSON.parse(message) as ChatCompletion
      if (parsed.choices[0].finish_reason === 'stop') {
        break
      }
      const text = parsed.choices[0].delta.content
      if ([undefined, '\n\n'].includes(text)) {
        continue
      }
      stream.push(text)
    }
    stream.push(null)
  })()
  return stream
}
