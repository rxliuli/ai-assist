import { Configuration, OpenAIApi } from 'openai'

const c = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
export const openai = new OpenAIApi(c)

const apiMap = new Map<string, OpenAIApi>()

export function getOpenAIApi(apiKey?: string): OpenAIApi {
  const key = (apiKey && apiKey.trim().length > 0 ? apiKey : process.env.OPENAI_API_KEY) as string
  if (!apiMap.has(key)) {
    apiMap.set(key, new OpenAIApi(new Configuration({ apiKey: key })))
  }
  return apiMap.get(key)!
}
