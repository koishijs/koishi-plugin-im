import { $ } from 'minato'
import { Context } from '@satorijs/core'
import { Channel, Friend, Login, Message, Guild, Member } from '../types'
import { genId } from '@satorijs/plugin-im-utils'

export class MessageData {
  constructor(public ctx: Context) {}

  fetch = async (
    login: Login,
    cid: string,
    endpoint: number,
    dir: Message.Direction = 'before',
    limit: number = 50
  ): Promise<any> => {
    let query = this.ctx.database
      .select('satori-im.message.test', (row) =>
        $.and(
          dir === 'before' ? $.lt(row.createdAt, endpoint) : $.gt(row.createdAt, endpoint),
          $.not(row.deleted),
          $.eq(row.channel.id, cid)
        )
      )
      .orderBy('createdAt', dir === 'before' ? 'desc' : 'asc')

    if (limit > 0) {
      query = query.limit(limit)
    }
    return query.execute()
  }

  getUnreadCount = async (login: Login, cid: string): Promise<number> => {
    // TODO:
    const channel = (
      await this.ctx.database.get('satori-im.channel', {
        id: cid,
      })
    )[0]

    const defaultLastRead =
      channel?.type !== Channel.Type.DIRECT
        ? (
            await this.ctx.database.get('satori-im.member', {
              user: { id: login.selfId },
              guild: { id: channel.guild!.id },
            })
          )[0].createdAt!
        : 0

    let query = await this.ctx.database
      .join(
        { m: 'satori-im.message.test', cs: 'satori-im.channel.settings' },
        (row) =>
          $.and($.eq(row.m.channel.id, row.cs.channel.id), $.eq(row.cs.user.id, login.selfId!)),
        {
          m: false,
          cs: true,
        }
      )
      .where((row) =>
        $.and(
          $.eq(row.m.channel.id, cid),
          $.or(
            $.gt(row.m.createdAt, row.cs.lastRead),
            $.and($.eq($.ifNull(row.cs.lastRead, -1), -1), $.gt(row.m.createdAt, defaultLastRead))
          )
        )
      )
      .groupBy('cs.user.id', {
        unread: (row) => $.count(row.m),
      })
      .execute()

    return query[0]?.unread || 0
  }

  create = async (login: Login, data: Message) => {
    let guild: Guild | undefined = undefined
    let member: Member | undefined = undefined
    let friend: Friend | undefined = undefined
    const channel = await this.ctx.im.data.channel.fetch(login, data.channel.id)

    if (data.channel!.type !== Channel.Type.DIRECT) {
      guild = await this.ctx.im.data.guild.fetch(login, channel.guild!.id)
      member = await this.ctx.im.data.guild.Member.fetch(login, guild.id, login.selfId!)
    } else {
      friend = await this.ctx.im.data.friend._fetch(channel.friend!.id)
    }

    const result = await this.ctx.database.create('satori-im.message.test', {
      id: genId(),
      createdAt: new Date().getTime(),
      content: data.content,
      channel: { $literal: { id: data.channel!.id } },
      user: { $literal: { id: data.user!.id } },
      quote: {
        id: data.quote?.id,
      },
    })

    const user = await this.ctx.im.data.user.fetch(login, login.selfId!)
    this.ctx.im.event.pushEvent({
      selfId: login.selfId!,
      type: 'message',
      message: { ...result, user, member, sid: data.sid },
      channel: result.channel,
      guild,
      friend,
    })
  }

  update = async (login: Login, cid: string, mid: string, content: string) => {
    const result = await this.ctx.database.set(
      'satori-im.message.test',
      {
        id: mid,
        deleted: false,
      },
      { content }
    )
    if (!result.matched) {
      throw new Error()
    }
    if (!result.modified) {
      throw new Error()
    }
    this.ctx.im.event.pushEvent({
      selfId: login.selfId!,
      type: 'message-updated',
      message: { id: mid, content } as Message,
      channel: { id: cid } as Channel,
    })
  }

  softDel = async (login: Login, cid: string, mid: string) => {
    const result = await this.ctx.database.set('satori-im.message.test', mid, { deleted: true })
    if (!result.matched) {
      throw new Error()
    }
    if (!result.modified) {
      throw new Error()
    }
    this.ctx.im.event.pushEvent({
      selfId: login.selfId!,
      type: 'message-deleted',
      message: { id: mid } as Message,
      channel: { id: cid } as Channel,
    })
  }
}
