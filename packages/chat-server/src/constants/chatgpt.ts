import { Configuration, OpenAIApi } from 'openai'

// 禁用缓存看看效果
export function getOpenAIApi(apiKey?: string): OpenAIApi {
  const key = (apiKey && apiKey.trim().length > 0 ? apiKey : process.env.OPENAI_API_KEY) as string
  return new OpenAIApi(new Configuration({ apiKey: key, basePath: process.env.OPENAI_BASE_PATH }))
}
