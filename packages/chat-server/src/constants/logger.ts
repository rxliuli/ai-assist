import winston, { format } from 'winston'
import { Middleware } from 'koa'

export const logger = winston.createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.cli() }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

export function httpLogger(): Middleware {
  return async (ctx, next) => {
    // 创建一个新的空对象作为每个请求的容器
    const requestLogger: Record<string, any> = {}
    try {
      // 记录请求开始时间
      requestLogger.startTime = new Date()

      // 复制请求相关的一些属性到 requestLogger 对象中，方便后续记录日志
      requestLogger.method = ctx.method
      requestLogger.url = ctx.url
      requestLogger.queryParams = ctx.query
      requestLogger.requestBody = ctx.request.body

      // 调用 next 函数继续处理请求
      await next()
    } finally {
      // 记录请求结束时间
      requestLogger.endTime = new Date()

      // 计算请求花费的时间
      requestLogger.duration = requestLogger.endTime - requestLogger.startTime

      // 复制响应相关的一些属性到 requestLogger 对象中，方便后续记录日志
      requestLogger.status = ctx.status
      requestLogger.responseBody = ctx.body

      // 记录日志
      logger.info(JSON.stringify(requestLogger))
    }
  }
}
