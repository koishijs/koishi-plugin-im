import { $ } from 'minato'
import { Context } from '@satorijs/core'
import { Channel, Login } from '../types'
import { genId } from '@satorijs/plugin-im-utils'

export class ChannelData {
  constructor(public ctx: Context) {}

  async fetch(cid: string): Promise<Channel> {
    const result = await this.ctx.database.get('satori-im.channel', {
      id: cid,
    })
    return result[0]
  }

  async create(gid: string, data: { name: string }): Promise<Channel> {
    return await this.ctx.database.create('satori-im.channel', {
      id: genId(),
      name: data.name,
      type: Universal.Channel.Type.TEXT,
      parentId: gid,
    })
  }

  async _update(cid: string, data: { name: string }): Promise<void> {
    const result = await this.ctx.database.set('satori-im.channel', cid, {
      name: data.name,
    })
  }

  async _softDel(cid: string): Promise<void> {
    const result = await this.ctx.database.remove('satori-im.channel', cid)
  }
}
