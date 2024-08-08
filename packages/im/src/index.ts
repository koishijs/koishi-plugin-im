import { Context, Schema, Service } from '@satorijs/core'
import {} from '@satorijs/plugin-server'
import { Client } from '@cordisjs/plugin-webui'
import { ImTypes } from '@satorijs/plugin-im'
import { EntryService } from './entry'

export interface Data {
  serverUrl: string
  eventChan: ImTypes.Event
}

export const name = 'im'

declare module 'cordis' {
  interface Context {
    'im.entry': EntryService
  }
}

export interface Config {}

export const inject = ['im.event']

export const Config: Schema<Config> = Schema.object({})

export default function apply(ctx: Context) {
  ctx.plugin(EntryService)
}
