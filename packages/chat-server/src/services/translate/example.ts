import { Configuration, OpenAIApi } from 'openai'

const c = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(c)

const r = await openai.createChatCompletion({
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'system',
      content: `请将以下文本的语言从 ${'zh-cn'} 翻译为 ${'en'}`,
    },
    {
      role: 'user',
      content: '你好，世界',
    },
  ],
})
console.log(r.status, r.statusText)

fetch('https://ai.rxliuli.com/translate', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'hello world',
    from: 'en',
    to: 'zh-cn',
  }),
})
