import { $ } from 'minato'
import { Context } from '@satorijs/core'
import { Login } from '../types'
import { genId } from '@satorijs/plugin-im-utils'
import { Notification, Channel, Guild, Friend } from '../types'

declare module '../types' {
  namespace Notification {
    interface Type {
      'new-friendship': Friend
      'new-guild': Guild
      'member-kick': void
    }
  }
}

export class NotificationData {
  constructor(public ctx: Context) {}

  list = async (login: Login) => {
    const result = await this.ctx.database
      .select(
        'satori-im.notification',
        {
          user: { id: login.selfId },
        },
        {
          settings: true,
          guild: true,
        }
      )
      .execute()
    return result
  }

  request = async (login: Login, target: string, content: string, gid?: string) => {
    const data: Notification = {
      id: genId(),
      createdAt: new Date().getTime(),
      shouldReply: true,
      selfId: login.selfId!,
      content,
    }

    let guild: Guild | undefined = undefined

    // HACK: cannot judge the case that row.guild.id is null or not.
    const result = gid
      ? await this.ctx.database
          .select('satori-im.notification', (row) =>
            $.and($.eq(row.selfId, login.selfId!), $.eq(row.user.id, target))
          )
          .execute()
      : await this.ctx.database
          .select('satori-im.notification', (row) =>
            $.and(
              $.eq(row.selfId, login.selfId!),
              $.eq(row.user.id, target),
              $.eq(row.guild.id, gid!)
            )
          )
          .execute()

    this.ctx.logger.info(result)

    if (!result.length) {
      const res = await this.ctx.database.create('satori-im.notification', {
        ...data,
        user: { $literal: { id: target } },
        guild: { $literal: { id: gid } },
      })

      if (gid) {
        guild = await this.ctx.im.data.guild.fetch(login, gid)
      }

      const invType = data.guild ? 'guild-member' : 'friend'
      this.ctx['im.event'].pushEvent({
        selfId: data.selfId!,
        type: data.shouldReply ? `${invType}-request` : 'notification-added',
        notification: res,
        user: { id: target },
        _data: data,
      }) // HACK: _data is not ideal.
    }
  }

  reply = async (login: Login, nid: string, reply: boolean) => {
    const result = await this.ctx.database.get('satori-im.notification', {
      id: nid,
      shouldReply: true,
    })
    if (!result.length) {
      return new Error()
    }
    const notification = result[0]
    const isGuild = !!notification.guild!.id

    let creation: any
    // HACK: directly created a relation here
    if (reply === true) {
      this.ctx.database.transact(async (db) => {
        if (reply) {
          if (isGuild) {
            await db.create('satori-im.member', {
              user: { $connect: { id: login.selfId } },
              guild: { $connect: { id: notification.guild!.id } },
              createdAt: new Date().getTime(),
            })
          } else {
            creation = await db.create('satori-im.friend', {
              id: genId(),
              self: { id: login.selfId },
              target: { id: notification.selfId },
              createdAt: new Date().getTime(),
            })
            const channel = await db.create('satori-im.channel', {
              id: genId(),
              type: Channel.Type.DIRECT,
              friend: { id: creation.id },
              parentId: creation.id,
            })
            await db.create('satori-im.channel.settings', {
              user: { $literal: { id: login.selfId } },
              channel: { $literal: { id: channel.id } },
            })
            await db.create('satori-im.friend.settings', {
              user: { $literal: { id: login.selfId } },
              friend: { $literal: { id: creation.id } },
            })
            await db.create('satori-im.friend.settings', {
              user: { $literal: { id: notification.selfId } },
              friend: { $literal: { id: creation.id } },
            })
          }
        }
        await db.remove('satori-im.notification', { id: nid })
        this.ctx['im.event'].pushEvent({
          selfId: login.selfId!,
          type: `${isGuild ? 'guild' : 'friend'}-updated`,
          guild: isGuild ? (creation as Guild) : undefined,
          friend: !isGuild ? (creation as Friend) : undefined,
        })
      })
    }
  }
}
