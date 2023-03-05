import { ChatGPTAPI } from 'chatgpt'

export const chatGPTAPI = new ChatGPTAPI({
  apiKey: localStorage.getItem('openai-api-key')!,
})
