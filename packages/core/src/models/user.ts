import { Context } from '@satorijs/core'
import { User } from '../types'

export class UserData {
  constructor(public ctx: Context) {}
  }

  async fetch(uid: string): Promise<User> {
    const result = await this.ctx.database.get('satori-im.user', uid, [
      'id',
      'name',
      'avatar',
      'nick',
    ])
    return result[0]
  }

  async update(data: { uid: string } & Partial<User>): Promise<void> {
    const result = await this.ctx.database.set('satori-im.user', data.uid, (row) => ({
      nick: data.nick,
      avatar: data.avatar,
    }))
    if (!result.modified) {
      throw new Error()
    }
  }

  async softDel(uid: string): Promise<void> {}

  // TODO: waiting for implementation.
  async search(keyword: string): Promise<Array<User>> {
    return this.ctx.database.get('satori-im.user', {})
  }
}
