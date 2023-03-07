import { Configuration, OpenAIApi } from 'openai'

const c = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
export const openai = new OpenAIApi(c)
