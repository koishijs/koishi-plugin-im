import { computed, reactive, ref, watch } from 'vue'
import { Context, send, Service } from '@cordisjs/client'
import {} from '@cordisjs/loader'
import { Dict } from '@satorijs/core'
import {} from '@satorijs/plugin-im-webui'
import type { Im } from '@satorijs/plugin-im'
import shared from './shared'
import components from './components'
import webui, { Scene, ImApp } from './app'
import { getDisplayName } from './app/user'

import 'virtual:uno.css'

export { default as shared } from './shared'
export * from './icons'
export * from '@satorijs/plugin-im-utils'

declare module '@cordisjs/client' {
  interface Context {
    'im.client': ChatService
  }
}

interface Cache {
  users: Dict<Im.User>
  members: Dict<Dict<Im.Member>>
  tasks: Dict<Promise<Im.User | Im.Member>>
}

interface LoggedUser {
  login: Im.Login
  friends: Array<Im.Friend.Payload>
  guilds: Array<Im.Guild>
  notifications: Array<Im.Notification>
  messages: Dict<{
    data: Array<Im.Message>
    unread: number
  }>
}

const localToken = shared.value.token
let chat = reactive<LoggedUser & Cache>({
  users: {},
  members: {},
  tasks: {},
  messages: {},
} as any)

export default class ChatService extends Service {
  static inject = { optional: ['im.client'] }

  status = ref<'verifying' | 'logging-in' | 'syncing' | 'logged'>('verifying')

  login = computed(() => chat.login)

  guilds = computed(() => chat.guilds)

  friends = computed(() => chat.friends)

  get _cache() {
    return chat
  }

  constructor(public ctx: Context) {
    super(ctx, 'im.client', true)
    ctx.plugin(components)
    ctx.plugin(webui)

    if (localToken) {
      send('im/v1/login-add', { login: { token: localToken } as Im.Login })
        .then((data) => {
          this.setLogin(data)
        })
        .catch(() => {
          shared.value.token = ''
          this.status.value = 'logging-in'
        })
    } else {
      this.status.value = 'logging-in'
    }

    ctx.addEventListener('beforeunload', async () => {
      await Scene.dispose()
    })

    ctx.page({
      name: 'IM',
      path: '/im',
      icon: 'activity:chat',
      component: ImApp,
    })
  }

  // TODO: promisified.
  async setLogin(login: Im.Login) {
    chat.login = null as any
    chat.friends = null as any
    chat.guilds = null as any
    chat.notifications = null as any
    chat.messages = {} as any

    chat.login = login
    chat.login.selfId = login.user!.id
    chat.users[login.selfId!] = login.user!
    shared.value.token = login.token

    this.status.value = 'syncing'

    try {
      Scene.init() // trans to Service?

      chat.guilds = await send('im/v1/guild/fetch-all', { login: chat.login })
      chat.friends = await send('im/v1/friend/fetch-all', { login: chat.login })

      const channels = await send('im/v1/channel/recent', { login: chat.login })

      for (const channel of channels) {
        // TODO: Dont import value like Im.Channel.Type
        if (channel.type !== 1) {
          const guild = chat.guilds.find((value) => value.id === channel.guild?.id)!
          await Scene.create('chat-guild', {
            uid: channel.id,
            title: guild.name!,
            subtitle: channel.name,
            channel: channel,
            guild,
          })
          continue
        }
        const friend = chat.friends.find((value) => value.id === channel.friend?.id)!
        await Scene.create('chat-friend', {
          uid: channel.id,
          title: getDisplayName(friend.user, { name: friend.nick! }),
          subtitle: channel!.name,
          friend,
          channel,
        })
      }

      for (const friend of chat.friends) {
        chat.users[friend.user.id] = friend.user
      }
    } catch (err) {
      this.status.value = 'logging-in'
      return
    }

    this.status.value = 'logged'
  }

  getLogin() {
    return chat.login
  }

  logout() {
    chat.login = undefined!
    shared.value.token = ''

    this.status.value = 'logging-in'
  }

  async getUser(uid: string) {
    if (!chat.users[uid] && !chat.tasks[uid]) {
      chat.users[uid] = await send('im/v1/user/fetch', { login: chat.login, uid })
      delete chat.tasks[uid]
    }
    return chat.users[uid]
  }

  async getMember(gid: string, uid: string) {
    const key = `${gid}-${uid}`
    if (!chat.members[gid]) chat.members[gid] = {}
    if (!chat.members[gid][uid] && !chat.tasks[key]) {
      chat.members[gid][uid] = await send('im/v1/guild-member/fetch', {
        login: chat.login,
        gid,
        uid,
      })
      delete chat.tasks[key]
    }
    return chat.members[gid][uid]
  }

  async _getAllMembers(gid: string) {
    const result = await send('im/v1/guild-member/fetch-all', {
      login: chat.login,
      gid,
    })

    for (let i = 0; i < result.length; i++) {
      chat.members[gid][result[i].user.id] = result[i]
    }

    return Object.values(chat.members[gid])
  }

  mountMessage(message: Im.Message) {
    chat.messages[message.channel!.id].data.push(message)
  }

  async getMessageData(channel: Im.Channel) {
    const cid = channel.id
    const messages = chat.messages[cid]

    if (!messages) {
      const _ = undefined
      chat.messages[cid] = {
        data: [],
        unread: await send('im/v1/message/unread-count', { login: chat.login, cid }),
      }
      await this.updateMessageList(channel, _, _, 30)
    }

    return chat.messages[cid]
  }

  async updateMessageList(
    channel: Im.Channel,
    dir: 'before' | 'after' = 'before',
    endpoint: number = new Date().getTime(),
    limit: number = 10
  ) {
    const cid = channel.id
    const data = await send('im/v1/message/fetch', {
      login: chat.login,
      cid,
      endpoint,
      dir,
      limit,
    })

    for (const message of data) {
      const user = await this.getUser(message.user!.id)
      message.user = user
      if (channel.type !== 1) {
        const member = await this.getMember(channel.guild!.id, message.user!.id)
        message.member = member
      }
    }

    dir === 'before'
      ? chat.messages[cid].data.unshift(...data.reverse())
      : chat.messages[cid].data.push(...data)
  }

  _eventHandler = async (event: Im.Event) => {
    this.ctx.logger('im.client').info(`[event] type: ${event.type}`)

    const item = event.type.split('-')[0]
    const ptr = chat[`${item}s`]

    switch (true) {
      case 'message' === event.type: {
        const response = event.message!
        const cid = response.channel!.id

        if (!chat.messages[cid]) {
          if (response.member) {
            const guild = this.guilds.value.find((value) => value.id === response.member!.guild.id)!
            const channel = guild?.channels?.find((value) => value.id === cid)!
            await Scene.create('chat-guild', {
              uid: cid,
              title: guild?.name!,
              subtitle: channel!.name,
              guild,
              channel,
            })
          } else {
            const friend = this.friends.value.find((value) => value.channel?.id === cid)!
            const channel = friend.channel!
            await Scene.create('chat-friend', {
              uid: cid,
              title: getDisplayName(friend.user, { name: friend.nick! }),
              subtitle: channel!.name,
              friend,
              channel,
            })
          }
        }

        if (response.user!.id === chat.login.selfId) {
          chat.messages[cid].data.some(
            (value, i) => value.sid === response.sid && chat.messages[cid].data.splice(i, 1)
          )
        } else {
          chat.messages[cid].unread += 1
        }

        const { sid: _, ...message } = response
        if (chat.messages[message.channel!.id]) {
          chat.messages[message.channel!.id].data.push(message)
        }
        break
      }
      case /-added$/.test(event.type): {
        ptr.push(event[item])
        break
      }
      case /-deleted$/.test(event.type): {
        ptr.filter((value: any) => value.id !== event[item])
        break
      }
      case /-updated$/.test(event.type): {
        const existingItem = ptr.find((value: any) => value.id === event[item])
        existingItem ? Object.assign(existingItem, event[item]) : ptr.push(event[item])
        break
      }
      default:
        console.error(`cannot resolve event: ${event}`)
    }
  }
}
