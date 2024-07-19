import {} from 'minato'
import {} from '@cordisjs/plugin-webui'
import { Context } from '@satorijs/core'

import ImDatabase from './database'
import { ImDataService } from './data'
import { ImEventService } from './notify'
import { ImLoginService } from './login'
import { Channel, Friend, Guild, Member, Message, Role, User } from './types'

export * as ImTypes from './types'
export * from './utils'

declare module '@cordisjs/plugin-webui' {
  interface Events {
    'im/v1/user/fetch'(uid: string): Promise<User>
    'im/v1/user/update'(data: { uid: string } & Partial<User>): Promise<void>
    'im/v1/user/remove'(uid: string): Promise<void>

    'im/v1/friend/fetch'(uid: string, target: string): Promise<Friend>
    'im/v1/friend/fetch-all'(uid: string): Promise<Array<Friend>>
    'im/v1/friend/remove'(uid: string, target: string): Promise<void>

    'im/v1/guild/fetch'(gid: string): Promise<Array<Guild>>
    'im/v1/guild/fetch-all'(uid: string): Promise<Array<Guild>>
    'im/v1/guild/create'(data: { name: string }): Promise<Guild>
    'im/v1/guild/remove'(gid: string): Promise<void>

    'im/guild-member/fetch'(
      uid: string,
      gid: string
    ): Promise<Omit<Member, 'guild'> & { role: Role }>
    'im/v1/guild-member/fetch-all'(
      gid: string
    ): Promise<Array<Omit<Member, 'guild'> & { role: Role }>>

    'im/v1/guild-role/fetch'(data: { gid: string; rid: string }): Promise<Role>
    'im/v1/guild-role/fetch-all'(gid: string): Promise<Array<Role>>
    'im/v1/guild-role/create'(uid: string, gid: string): Promise<Role>

    'im/v1/channel/fetch'(cid: string): Promise<Channel>
    'im/v1/channel/create'(gid: string, data: { name: string }): Promise<Channel>
    'im/v1/channel/remove'(cid: string): Promise<void>

    'im/v1/message/fetch'(id: string): Promise<Message>
    'im/v1/message/fetch-all'(data: { cid: string; uid?: string }): Promise<Array<Message>>
  }
}

declare module 'cordis' {
  interface Context {
    'im.data': ImDataService
    'im.event': ImEventService
    'im.login': ImLoginService
  }
}

export function apply(ctx: Context) {
  new ImDatabase(ctx)
  ctx.plugin(ImDataService)
  ctx.plugin(ImLoginService)
  ctx.plugin(ImEventService)
}
