import { $ } from 'minato'
import { Context } from '@satorijs/core'
import { Friend } from '../types'

export class FriendData {
  constructor(public ctx: Context) {
    ctx.webui.addListener('im/v1/friend/fetch', this.fetch)
    ctx.webui.addListener('im/v1/friend/fetch-all', this.fetchAll)
    ctx.webui.addListener('im/v1/friend/remove', this.hardDel)
  }

  async fetch(uid: string, target: string): Promise<Friend> {
    const result = await this.ctx.database.get('satori-im.friend', (row) =>
      $.or(
        $.and($.eq(row.origin.id, uid), $.eq(row.target.id, target)),
        $.and($.eq(row.origin.id, target), $.eq(row.target.id, uid))
      )
    )
    return result[0]
  }

  async fetchAll(uid: string): Promise<Array<Friend>> {
    const result = await this.ctx.database.get('satori-im.friend', (row) =>
      $.or($.eq(row.origin.id, uid), $.eq(row.target.id, uid))
    )
    return result
  }

  async _update(uid: string, target: string, data: Partial<Friend>): Promise<void> {
    const result = await this.ctx.database.set(
      'satori-im.friend',
      (row) =>
        $.or(
          $.and($.eq(row.origin.id, uid), $.eq(row.target.id, target)),
          $.and($.eq(row.origin.id, target), $.eq(row.target.id, uid))
        ),
      {
        pinned: data.pinned,
        nick: data.nick,
        group: data.group,
      }
    )
  }

  async hardDel(uid: string, target: string): Promise<void> {
    const result = await this.ctx.database.remove('satori-im.friend', (row) =>
      $.or(
        $.and($.eq(row.origin.id, uid), $.eq(row.target.id, target)),
        $.and($.eq(row.origin.id, target), $.eq(row.target.id, uid))
      )
    )
  }
}
