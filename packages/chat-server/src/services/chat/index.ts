import { ChatCompletionRequestMessage } from 'openai'
import { openai } from '../../constants/chatgpt'

export async function chat(messages: Array<ChatCompletionRequestMessage>) {
  const r = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: messages,
  })
  return r.data.choices[0].message?.content
}
