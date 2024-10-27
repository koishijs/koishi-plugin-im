import { $ } from 'minato'
import { Context } from '@satorijs/core'
import { Channel, Friend, Login, ChunkOptions } from '../types'
import { genId } from '@satorijs/plugin-im-utils'

export class FriendData {
  constructor(public ctx: Context) {}

  fetch = async (login: Login, fid: string): Promise<Friend.Payload> => {
    const selfId = login.selfId!
    const result = await this.ctx.database
      .join(
        {
          f: 'satori-im.friend',
          u: 'satori-im.user',
          us: 'satori-im.user.settings',
          fs: 'satori-im.friend.settings',
          c: 'satori-im.channel',
        },
        (row) =>
          $.and(
            $.or(
              $.and($.eq(row.f.target.id, login.selfId!), $.eq(row.f.self.id, row.u.id)),
              $.and($.eq(row.f.self.id, login.selfId!), $.eq(row.f.target.id, row.u.id))
            ),
            $.eq(row.f.id, row.fs.friend.id),
            $.eq(row.u.id, row.us.user.id),
            $.eq(row.c.parentId, row.f.id),
            $.eq(row.c.type, Channel.Type.DIRECT)
          ),
        {
          f: false,
          u: false,
          c: false,
          us: true,
          fs: true,
        }
      )
      .where((row) => $.and($.ne(row.u.id, selfId), $.eq(row.f.id, fid)))
      .project({
        id: (row) => row.f.id,
        createdAt: (row) => row.f.createdAt,
        user: (row) => row.u,
        channel: (row) => row.c,
        nick: (row) => row.fs.nick,
        level: (row) => row.us.level,
        pinned: (row) => row.fs.pinned,
        group: (row) => row.fs.group,
      })
      .execute()

    return result[0]
  }

  _fetch = async (fid: string): Promise<Friend> => {
    const result = await this.ctx.database.get('satori-im.friend', {
      id: fid,
    })
    return result[0]
  }

  list = async (login: Login): Promise<Array<Friend.Payload>> => {
    const selfId = login.selfId!
    // const result = await this.ctx.database
    //   .select(
    //     'satori-im.friend',
    //     (row) => $.or($.eq(row.target.id, selfId), $.eq(row.self.id, selfId)),
    //     {
    //       settings: true,
    //       channel: true,
    //     }
    //   )
    //   .execute()
    // result.map((value) => value.settings!.filter((value) => value.user.id === login.selfId))
    // return result
    const result = await this.ctx.database
      .join(
        {
          f: 'satori-im.friend',
          u: 'satori-im.user',
          c: 'satori-im.channel',
          us: 'satori-im.user.settings',
          fs: 'satori-im.friend.settings',
        },
        (row) => $.and($.eq(row.f.id, row.fs.friend.id), $.eq(row.u.id, row.us.user.id)),
        {
          f: false,
          u: false,
          c: false,
          us: true,
          fs: true,
        }
      )
      .where((row) =>
        $.and(
          $.or(
            $.and($.eq(row.f.target.id, selfId), $.eq(row.f.self.id, row.u.id)),
            $.and($.eq(row.f.self.id, selfId), $.eq(row.f.target.id, row.u.id))
          ),
          $.ne(row.u.id, selfId),
          $.eq(row.c.parentId, row.f.id),
          $.eq(row.c.type, Channel.Type.DIRECT)
        )
      )
      .project({
        id: (row) => row.f.id,
        createdAt: (row) => row.f.createdAt,
        user: (row) => row.u,
        channel: (row) => row.c,
        nick: (row) => row.fs.nick,
        level: (row) => row.us.level,
        pinned: (row) => row.fs.pinned,
        group: (row) => row.fs.group,
      })
      .execute()

    return result
  }

  update = async (login: Login, fid: string, common?: {}, critical?: {}) => {
    // const selfId = login.selfId!
    // const result = await this.ctx.database.set(
    //   'satori-im.friend',
    //   (row) =>
    //     $.and($.or($.eq(row.target.id, selfId), $.eq(row.self.id, selfId)), $.eq(row.id, fid)),
    //   {
    //     pinned,
    //     nick: nick,
    //     group: group,
    //   }
    // )
    // if (!result.matched) {
    //   throw new Error()
    // }
    // if (!result.modified) {
    //   throw new Error()
    // }
    // this.ctx.im.event.pushEvent({
    //   type: 'friend-updated',
    //   selfId,
    //   friend: { id: fid, pinned, nick, group } as Friend,
    // })
  }

  softDel = async (login: Login, fid: string) => {
    const selfId = login.selfId!
    this.ctx.database.transact(async (db) => {
      await db.set(
        'satori-im.friend',
        (row) =>
          $.and($.or($.eq(row.target.id, selfId), $.eq(row.self.id, selfId)), $.eq(row.id, fid)),
        {
          deleted: true,
        }
      )
      await db.set(
        'satori-im.channel',
        {
          parentId: fid,
          type: Channel.Type.DIRECT,
        },
        {
          deleted: true,
        }
      )
      await db.remove('satori-im.friend.settings', {
        friend: { id: fid },
      })
      await db.remove('satori-im.channel.settings', {
        channel: { parentId: fid, type: Channel.Type.DIRECT },
      })
    })
    this.ctx.im.event.pushEvent({
      type: 'friend-deleted',
      selfId,
      friend: { id: fid } as Friend,
    })
  }

  search = async (
    login: Login,
    keyword: string,
    options: ChunkOptions & { except: Array<string> }
  ): Promise<Array<any>> => {
    const keywordRegex = new RegExp(`${keyword}`, 'i')
    let query = this.ctx.database
      .join(
        { f: 'satori-im.friend', user: 'satori-im.user', settings: 'satori-im.friend.settings' },
        (row) =>
          $.and(
            $.or(
              $.and($.eq(row.f.target.id, login.selfId!), $.eq(row.f.self.id, row.user.id)),
              $.and($.eq(row.f.self.id, login.selfId!), $.eq(row.f.target.id, row.user.id))
            ),
            $.or($.eq(row.f.id, row.settings.friend.id), $.eq(row.settings.friend.id, '')),
            $.or(
              $.regex(row.user.name, keywordRegex),
              $.regex(row.user.nick, keywordRegex),
              $.eq(row.user.id, keyword)
            ),
            ...options.except.map((value) => $.ne(row.user.id, value))
          ),
        {
          f: false,
          user: false,
          settings: true,
        }
      )
      .where((row) => $.ne(row.user.id, login.selfId!))
    if (options.cursor === '#begin') {
      query = query.orderBy('user.id', 'asc')
    } else if (options.direction === 'before') {
      query = query.where((row) => $.lt(row.user.id, options.cursor)).orderBy('user.id', 'desc')
    } else if (options.direction === 'after') {
      query = query.where((row) => $.gt(row.user.id, options.cursor)).orderBy('user.id', 'asc')
    } else {
      throw Error()
    }
    return query.limit(options.limit).execute()
  }
}
