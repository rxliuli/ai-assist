import Application from 'koa'
import cors from '@koa/cors'
import Router from '@koa/router'
import serve from 'koa-static'
import * as path from 'path'
import { generateUrl } from './generate'
import Joi from 'joi'
import plugin from './.well-known/ai-plugin.json'
import Mustache from 'mustache'

const router = new Router()

const schema = Joi.object({
  width: Joi.number().integer().required(),
  height: Joi.number().integer().optional(),
  id: Joi.number().integer().optional(),
  seed: Joi.string().optional(),
  grayscale: Joi.boolean().optional(),
  blur: Joi.alternatives().try(Joi.boolean(), Joi.number()).optional(),
  ext: Joi.string().valid('jpg', 'webp').optional(),
})

router.get('/.well-known/ai-plugin.json', (ctx) => {
  ctx.body = JSON.parse(
    Mustache.render(JSON.stringify(plugin), {
      baseUrl: process.env.BASE_URL || 'http://localhost:8080',
    }),
  )
})

router.get('/generate', async (ctx) => {
  const query = {
    width: Number(ctx.query.width),
    height: ctx.query.height ? Number(ctx.query.height) : undefined,
    id: ctx.query.id ? Number(ctx.query.id) : undefined,
    seed: ctx.query.seed || undefined,
    grayscale: ctx.query.grayscale === 'true' ? true : false,
    blur: ctx.query.blur === 'true' ? true : ctx.query.blur ? Number(ctx.query.blur) : undefined,
    ext: ctx.query.ext || undefined,
  }

  const { error, value } = schema.validate(query)

  if (error) {
    ctx.status = 400
    ctx.body = { error: error.details[0].message }
    return
  }

  ctx.body = {
    url: generateUrl(value),
  }
})

const app = new Application()

app
  .use(cors())
  .use(router.routes())
  .use(
    serve(path.resolve(__dirname, '../public/'), {
      hidden: true,
    }),
  )

app.listen(8080)

console.log('server: http://localhost:8080/')
