import { Context, Schema } from '@satorijs/core'
import ImService, { Im } from '@satorijs/plugin-im'
import { EntryService } from './entry'
import { v1Wrapper } from '@satorijs/plugin-im-utils'

export interface Data {
  serverUrl: string
  eventChan: Im.Event
}

export const name = 'im'

declare module 'cordis' {
  interface Context {
    im: ImService
    'im.entry': EntryService
  }
}

declare module '@cordisjs/plugin-webui' {
  interface Events {
    'im/v1/login'(data: { name: string; password: string }): Promise<Im.Login>
    'im/v1/login-add'(data: { login: Im.Login }): Promise<Im.Login>
    'im/v1/login-change'(data: { uid: string; status: number }): Promise<void>
    'im/v1/login-remove'(data: { login: Im.Login }): Promise<void>
    'im/v1/register'(data: { name: string; password: string }): Promise<string>
    'im/v1/validate-name'(data: { name: string }): Promise<boolean>

    'im/v1/search/user'(data: {
      login: Im.Login
      keyword: string
      options: Im.ChunkOptions & { except: string[] }
    }): Promise<Array<Im.User>>
    'im/v1/search/guild'(data: {
      login: Im.Login
      keyword: string
      options: Im.ChunkOptions & { except: string[] }
    }): Promise<Array<Im.Guild>>
    'im/v1/search/message'(data: {
      login: Im.Login
      keyword: string
      options: Im.ChunkOptions & { except: string[] }
    }): Promise<Array<Im.Message>>
    'im/v1/search/friend'(data: {
      login: Im.Login
      keyword: string
      options: Im.ChunkOptions & { except: string[] }
    }): Promise<Array<Im.Message>>

    'im/v1/user/fetch'(data: { login: Im.Login; uid: string }): Promise<Im.User>
    'im/v1/user/update'(data: { login: Im.Login; nick: string; password: string }): Promise<void>
    'im/v1/user/remove'(data: { login: Im.Login }): Promise<void>

    'im/v1/friend/fetch'(data: { login: Im.Login; fid: string }): Promise<Im.Friend.Payload>
    'im/v1/friend/fetch-all'(data: { login: Im.Login }): Promise<Array<Im.Friend.Payload>>
    'im/v1/friend/remove'(data: { login: Im.Login; fid: string }): Promise<void>

    'im/v1/guild/fetch'(data: { login: Im.Login; gid: string }): Promise<Im.Guild>
    'im/v1/guild/fetch-all'(data: { login: Im.Login }): Promise<Array<Im.Guild>>
    'im/v1/guild/create'(data: {
      login: Im.Login
      name: string
      options: { inviteUsers?: string[]; initialChannelName?: string }
    }): Promise<Im.Guild>
    'im/v1/guild/update'(data: { login: Im.Login; gid: string; name: string }): Promise<void>
    'im/v1/guild/remove'(data: { login: Im.Login; gid: string }): Promise<void>
    'im/v1/guild-member/fetch'(data: {
      login: Im.Login
      gid: string
      uid: string
    }): Promise<Im.Member>
    'im/v1/guild-member/fetch-all'(data: {
      login: Im.Login
      gid: string
    }): Promise<Array<Im.Member>>
    'im/v1/guild-member/update'(data: {
      login: Im.Login
      gid: string
      uid?: string
      name?: string
    }): Promise<void>
    'im/v1/guild-member/kick'(data: { login: Im.Login; gid: string; uid: string }): Promise<void>
    'im/v1/guild-role/fetch'(data: { login: Im.Login; gid: string; rid: string }): Promise<Im.Role>
    'im/v1/guild-role/fetch-all'(data: { login: Im.Login; gid: string }): Promise<Array<Im.Role>>
    'im/v1/guild-role/create'(data: { login: Im.Login; uid: string; gid: string }): Promise<Im.Role>
    'im/v1/guild-role/update'(data: { login: Im.Login; rid: string }): Promise<void>
    'im/v1/guild-role/remove'(data: { login: Im.Login; rid: string }): Promise<void>

    'im/v1/channel/fetch'(data: { login: Im.Login; cid: string }): Promise<Im.Channel>
    'im/v1/channel/create'(data: {
      login: Im.Login
      gid: string
      name: string
    }): Promise<Im.Channel>
    'im/v1/channel/update'(data: { login: Im.Login; cid: string; name: string }): Promise<void>
    'im/v1/channel/remove'(data: { login: Im.Login; cid: string }): Promise<void>
    'im/v1/channel/update-settings'(data: { login: Im.Login; cid: string }): Promise<void>
    'im/v1/channel/recent'(data: { login: Im.Login }): Promise<Array<Im.Channel>>

    'im/v1/message/fetch'(data: {
      login: Im.Login
      cid: string
      endpoint: number
      dir?: 'before' | 'after'
      limit?: number
    }): Promise<Array<Im.Message>>
    'im/v1/message/create'(data: { login: Im.Login; message: Im.Message }): Promise<void>
    'im/v1/message/update'(data: { login: Im.Login; message: Im.Message }): Promise<void>
    'im/v1/message/recall'(data: { login: Im.Login; cid: string; id: string }): Promise<void>
    'im/v1/message/unread-count'(data: { login: Im.Login; cid: string }): Promise<number>

    'im/v1/notification/fetch-all'(data: { login: Im.Login }): Promise<Array<Im.Notification>>

    'im/v1/invitation/friend'(data: {
      login: Im.Login
      target: string
      content: string
    }): Promise<void>
    'im/v1/invitation/member'(data: {
      login: Im.Login
      target: string
      content: string
      gid: string
    }): Promise<void>
    'im/v1/invitation/reply'(data: { login: Im.Login; nid: string; reply: boolean }): Promise<void>

    'im/v1/file-upload'(data: { login: Im.Login; b64: string }): Promise<string>
    'im/v1/avatar-upload'(data: { login: Im.Login; b64: string; gid?: string }): Promise<string>
  }
}

export interface Config {}

export const inject = ['webui', 'server', 'im', 'im.event', 'im.auth', 'im.data']

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  ctx.plugin(EntryService)

  ctx.inject(['im.entry'], (ctx) => {
    ctx.webui.addListener('im/v1/login', async function (data: { name: string; password: string }) {
      // @ts-ignore
      const clientId = this['x-client-id']
      return ctx.im.auth.authenticate(data.name, data.password, clientId)
    }) // HACK: type ignorance
    ctx.webui.addListener('im/v1/login-add', async function (data: { login: Im.Login }) {
      // @ts-ignore
      data.login.clientId = this['x-client-id']
      return ctx.im.auth.authenticateWithToken(data.login)
    }) // HACK: type ignorance
    ctx.webui.addListener('im/v1/login-remove', v1Wrapper(ctx.im.auth.logout))
    ctx.webui.addListener('im/v1/register', v1Wrapper(ctx.im.auth.register))
    ctx.webui.addListener('im/v1/validate-name', v1Wrapper(ctx.im.auth.isNameUnique))

    ctx['im.entry'].addListenerWithAuth(
      'im/v1/invitation/friend',
      v1Wrapper(ctx.im.data.notification.request)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/invitation/member',
      v1Wrapper(ctx.im.data.notification.request)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/invitation/reply',
      v1Wrapper(ctx.im.data.notification.reply)
    )

    ctx['im.entry'].addListenerWithAuth('im/v1/channel/fetch', v1Wrapper(ctx.im.data.channel.fetch))
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/channel/create',
      v1Wrapper(ctx.im.data.channel.create)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/channel/update',
      v1Wrapper(ctx.im.data.channel.update)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/channel/remove',
      v1Wrapper(ctx.im.data.channel.softDel)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/channel/update-settings',
      v1Wrapper(ctx.im.data.channel.updateSettings)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/channel/recent',
      v1Wrapper(ctx.im.data.channel.fetchSessionList)
    )

    ctx['im.entry'].addListenerWithAuth('im/v1/friend/fetch', v1Wrapper(ctx.im.data.friend.fetch))
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/friend/fetch-all',
      v1Wrapper(ctx.im.data.friend.list)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/friend/remove',
      v1Wrapper(ctx.im.data.friend.softDel)
    )
    ctx['im.entry'].addListenerWithAuth('im/v1/search/friend', v1Wrapper(ctx.im.data.friend.search))

    ctx['im.entry'].addListenerWithAuth('im/v1/guild/fetch', v1Wrapper(ctx.im.data.guild.fetch))
    ctx['im.entry'].addListenerWithAuth('im/v1/guild/fetch-all', v1Wrapper(ctx.im.data.guild.list))
    ctx['im.entry'].addListenerWithAuth('im/v1/guild/create', v1Wrapper(ctx.im.data.guild.create))
    ctx['im.entry'].addListenerWithAuth('im/v1/guild/update', v1Wrapper(ctx.im.data.guild.update))
    ctx['im.entry'].addListenerWithAuth('im/v1/search/guild', v1Wrapper(ctx.im.data.guild.search))
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/guild-member/fetch',
      v1Wrapper(ctx.im.data.guild.Member.fetch)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/guild-member/fetch-all',
      v1Wrapper(ctx.im.data.guild.Member.list)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/guild-member/update',
      v1Wrapper(ctx.im.data.guild.Member.update)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/guild-member/kick',
      v1Wrapper(ctx.im.data.guild.Member.kick)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/guild-role/fetch',
      v1Wrapper(ctx.im.data.guild.Role.fetch)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/guild-role/fetch-all',
      v1Wrapper(ctx.im.data.guild.Role.list)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/guild-role/create',
      v1Wrapper(ctx.im.data.guild.Role.create)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/guild-role/update',
      v1Wrapper(ctx.im.data.guild.Role.update)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/guild-role/remove',
      v1Wrapper(ctx.im.data.guild.Role.hardDel)
    )

    ctx['im.entry'].addListenerWithAuth('im/v1/message/fetch', v1Wrapper(ctx.im.data.message.fetch))
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/message/create',
      v1Wrapper(ctx.im.data.message.create)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/message/update',
      v1Wrapper(ctx.im.data.message.update)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/message/recall',
      v1Wrapper(ctx.im.data.message.softDel)
    )
    ctx['im.entry'].addListenerWithAuth(
      'im/v1/message/unread-count',
      v1Wrapper(ctx.im.data.message.getUnreadCount)
    )

    ctx['im.entry'].addListenerWithAuth(
      'im/v1/notification/fetch-all',
      v1Wrapper(ctx.im.data.notification.list)
    )

    ctx['im.entry'].addListenerWithAuth('im/v1/user/fetch', v1Wrapper(ctx.im.data.user.fetch))
    ctx['im.entry'].addListenerWithAuth('im/v1/user/update', v1Wrapper(ctx.im.data.user.update))
    ctx['im.entry'].addListenerWithAuth('im/v1/search/user', v1Wrapper(ctx.im.data.user.search))

    ctx['im.entry'].addListenerWithAuth('im/v1/file-upload', v1Wrapper(ctx.im.data.writeFile))

    ctx['im.entry'].addListenerWithAuth('im/v1/avatar-upload', v1Wrapper(ctx.im.data.writeAvatar))
  })
}
