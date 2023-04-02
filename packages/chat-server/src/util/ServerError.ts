import { Middleware } from 'koa'
import { logger } from '../constants/logger'

/**
 * A server error that can be thrown to return a specific HTTP status code.
 */
export class ServerError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
  }
}

export function serverErrorHandle(): Middleware {
  return async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      if (err instanceof ServerError) {
        ctx.status = 500
        ctx.body = {
          code: err.code,
          message: err.message,
        }
        return
      }
      console.error(err)
      logger.error({ type: 'error', message: JSON.stringify(err) })
      ctx.status = 500
      ctx.body = {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal Server Error',
      }
    }
  }
}
