import { Context, Dict, Schema } from '@satorijs/core'
import {} from '@satorijs/plugin-server'
import {} from '@cordisjs/plugin-webui'
import {} from '@satorijs/plugin-im'

// export interface Data {
//   serverUrl: string
//   invitations: Dict<Array<Invitation>>
// }

export const name = 'im'

export const inject = ['webui', 'satori', 'satori.server', 'im.data', 'im.login', 'im.event']

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  const entry = ctx.webui.addEntry(
    {
      base: import.meta.url,
      dev: '../client/index.ts',
      prod: ['../dist/index.js', '../dist/style.css'],
    },
    () => ({
      // serverUrl: ctx.satori.server.url
      // invitations: ctx['im.invitation'].invitations
    })
  )
}
