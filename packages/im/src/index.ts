import { Context, Schema } from '@satorijs/core'
import {} from '@cordisjs/plugin-webui'

export const name = 'im'

export const inject = {
  required: ['webui'],
}

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  ctx.webui.addEntry({
    base: import.meta.url,
    dev: '../client/index.ts',
    prod: [
      '../dist/index.js',
      '../dist/style.css',
    ],
  })
}
