import { ChatCompletionRequestMessage } from 'openai'
import { getOpenAIApi } from '../../constants/chatgpt'
import { streamCompletion } from '@fortaine/openai/stream'
import { PassThrough, Stream } from 'stream'
import { logger } from '../../constants/logger'

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
export function chatStream(messages: Array<ChatCompletionRequestMessage>, apiKey: string, userId: string) {
  const stream = new Stream.Readable({
    read(size) {
      // do nothing
    },
  })
  ;(async () => {
    const chatStreamLogger: Record<string, any> = {}
    chatStreamLogger.name = 'chatStream'
    chatStreamLogger.startTime = new Date()
    chatStreamLogger.messages = messages
    try {
      const completion = await getOpenAIApi(apiKey).createChatCompletion(
        {
          model: 'gpt-3.5-turbo',
          messages,
          stream: true,
          user: userId,
        },
        {
          responseType: 'stream',
        },
      )
      let r = ''
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
        r += text
      }
      stream.push(null)
      chatStreamLogger.responseBody = r
    } catch (e) {
      logger.error('chatStream error' + JSON.stringify(e))
    } finally {
      chatStreamLogger.endTime = new Date()
      chatStreamLogger.duration = chatStreamLogger.endTime - chatStreamLogger.startTime
      chatStreamLogger.error = chatStreamLogger.endTime - chatStreamLogger.startTime
      logger.info(JSON.stringify(chatStreamLogger))
    }
  })()
  return stream
}
