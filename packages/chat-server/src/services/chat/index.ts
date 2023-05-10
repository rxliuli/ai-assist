import { ChatCompletionRequestMessage } from 'openai'
import { getOpenAIApi } from '../../constants/chatgpt'

export async function chat(messages: Array<ChatCompletionRequestMessage>, apiKey: string, userId: string) {
  const r = await getOpenAIApi(apiKey).createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: messages,
    user: userId,
  })
  return r.data.choices[0].message?.content
}
