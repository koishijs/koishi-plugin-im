import { $ } from 'minato'
import { Context } from '@satorijs/core'
import { Channel, Login } from '../types'
import { genId } from '@satorijs/plugin-im-utils'

export class ChannelData {
  constructor(public ctx: Context) {}

  fetch = async (login: Login, cid: string): Promise<Channel> => {
    const result = await this.ctx.database
      .select(
        'satori-im.channel',
        {
          id: cid,
          deleted: false,
          settings: {
            $or: [
              {
                $some: (row) => $.eq(row.user.id, login.selfId!),
              },
              {
                $none: {},
              },
            ],
          },
        },
        {
          friend: true,
          guild: true,
          settings: true,
        }
      )
      .execute()
    return result[0]
  }

  fetchSessionList = async (login: Login): Promise<Array<Channel>> => {
    const result = await this.ctx.database
      .select(
        'satori-im.channel',
        {
          deleted: false,
          settings: {
            $or: [
              {
                $some: (row) => $.eq(row.user.id, login.selfId!),
              },
              {
                $none: {},
              },
            ],
          },
          messages: {
            $some: (row) => $.gt(row.createdAt, MessageData.recentEndpoint()),
          },
        },
        {
          settings: true,
          guild: true,
          friend: true,
          messages: true,
        }
      )
      .project({
        id: (row) => row.id,
        type: (row) => row.type,
        name: (row) => row.name,
        friend: (row) => row.friend,
        guild: (row) => row.guild,
        settings: (row) => row.settings,
      })
      .execute()
    return result
  }

  create = async (login: Login, gid: string, name: string): Promise<Channel> => {
    const result = await this.ctx.database.create('satori-im.channel', {
      id: genId(),
      name: name,
      type: Channel.Type.TEXT,
      parentId: gid,
    })
    this.ctx.im.event.pushEvent({
      selfId: login.selfId!,
      type: 'channel-added',
      channel: result,
    })
    return result
  }

  update = async (login: Login, cid: string, name?: string) => {
    const result = await this.ctx.database.set(
      'satori-im.channel',
      {
        id: cid,
        deleted: false,
      },
      {
        name: name,
      }
    )
    if (!result.matched) {
      throw new Error()
    }
    if (!result.modified) {
      throw new Error()
    }
    this.ctx.im.event.pushEvent({
      selfId: login.selfId!,
      type: 'channel-updated',
      channel: { id: cid, name } as Channel,
    })
  }

  updateSettings = async (
    login: Login,
    cid: string,
    data: {
      level?: number
      nick?: string
      pinned?: boolean
    }
  ) => {
    await this.ctx.database.upsert('satori-im.channel.settings', (row) => [
      {
        lastRead: new Date().getTime(),
        channel: { id: cid },
        user: { id: login.selfId },
        ...data,
      },
    ])
  }

  softDel = async (login: Login, cid: string) => {
    this.ctx.database.transact(async (db) => {
      await db.set('satori-im.channel', cid, {
        deleted: false,
      })
      await db.remove('satori-im.channel.settings', {
        channel: { id: cid },
      })
    })

    this.ctx.im.event.pushEvent({
      selfId: login.selfId!,
      type: 'channel-deleted',
      channel: { id: cid } as Channel,
    })
  }
}

namespace MessageData {
  export function recentEndpoint(): number {
    const date = new Date()
    date.setMonth(date.getMonth() - 3)
    return date.getTime()
  }
}
