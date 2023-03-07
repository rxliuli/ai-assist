import { expect, it } from 'vitest'
import GPT3Tokenizer from 'gpt3-tokenizer'

it('GPT3Tokenizer', () => {
  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
  expect(tokenizer.encode('ChatGPT is great!').text.length).eq(6)
})
