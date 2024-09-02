import { $ } from 'minato'
import { Context } from '@satorijs/core'
import { ChunkOptions, Login, User } from '../types'

export class UserData {
  constructor(public ctx: Context) {}

  fetch = async (login: Login, uid: string): Promise<User> => {
    const result = await this.ctx.database.select('satori-im.user', { id: uid }).execute()
    return result[0]
  }

  fetchSettings = async (login: Login): Promise<User.Preferences> => {
    const result = await this.ctx.database
      .select('satori-im.user.preferences', { user: { id: login.selfId } })
      .execute()
    return result[0]
  }

  update = async (login: Login, nick: string) => {
    const result = await this.ctx.database.set('satori-im.user', { id: login.selfId }, (row) => ({
      nick: nick,
    }))
    if (!result.modified) {
      throw new Error()
    }
  }

  _update = async (uid: string, data: { nick?: string; avatarUrl?: string }) => {
    const result = await this.ctx.database.set('satori-im.user', { id: uid }, (row) => ({
      nick: data.nick,
      avatar: data.avatarUrl,
    }))
    if (!result.modified) {
      throw new Error()
    }

    // FIXME: update event
    // this.ctx['im.event'].pushEvent({
    //   type: 'user-updated',
    //   selfId: uid,
    //   guild: { id: gid, name } as Guild,
    // })
  }

  search = async (
    login: Login,
    keyword: string,
    options: ChunkOptions & { except: Array<string> }
  ): Promise<Array<User>> => {
    const keywordRegex = new RegExp(`${keyword}`, 'i')
    let query = this.ctx.database
      .select('satori-im.user')
      .where((row) =>
        $.and(
          $.or(
            $.regex(row.name, keywordRegex),
            $.regex(row.nick, keywordRegex),
            $.eq(row.id, keyword)
          ),
          ...options.except.map((value) => $.ne(row.id, value))
        )
      )

    if (options.cursor === '#begin') {
      query = query.orderBy('id', 'asc')
    } else if (options.direction === 'before') {
      query = query.where((row) => $.lt(row.id, options.cursor)).orderBy('id', 'desc')
    } else if (options.direction === 'after') {
      query = query.where((row) => $.gt(row.id, options.cursor)).orderBy('id', 'asc')
    } else {
      throw Error()
    }
    return query.limit(options.limit).execute()
  }
}
