import { ParameterizedContext } from 'koa'
import { ServerError } from '../../util/ServerError'

export function checkOpenAIApiKey(ctx: ParameterizedContext) {
  if (process.env.OPENAI_API_KEY) {
    return
  }
  const apiKey = ctx.get('OPENAI_API_KEY')
  if (!apiKey) {
    throw new ServerError('OPENAI_API_KEY is required', 'OPENAI_API_KEY_REQUIRE', 400)
  }
}
