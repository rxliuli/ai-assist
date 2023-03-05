import { TranslateOptions } from '@liuli-util/google-translate-api-free'
import { Configuration, OpenAIApi } from 'openai'

const c = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(c)

export interface TranslateParams {
  text: string
  from: TranslateOptions['from']
  to: TranslateOptions['from']
}

/**
 * 翻译
 * @param param0
 * @returns
 */
export async function translate({ text, from, to }: TranslateParams) {
  const r = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          from === 'auto'
            ? `Please translate the language of the following text from ${from} to ${to}`
            : `Please translate the language of the following text to ${to}`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
  })
  return r.data.choices[0].message?.content
}
