import { $ } from 'minato'
import { Context, Universal } from '@satorijs/core'
import { Guild, Member, Role } from '../types'
import { genId } from '../utils'

declare module '@cordisjs/plugin-webui' {
  interface Events {}
}

export class GuildData {
  public cache?: Universal.List<Guild>

  constructor(public ctx: Context) {
    ctx.webui.addListener('im/v1/guild/fetch', this.fetch)
    ctx.webui.addListener('im/v1/guild/fetch-all', this.list)
    ctx.webui.addListener('im/v1/guild/create', this.create)

    ctx.webui.addListener('im/v1/guild-member/fetch-all', this.Member.list)
  }

  async fetch(gid: string): Promise<Array<Guild>> {
    return this.ctx.database.get('satori-im.guild', gid, ['id', 'name', 'avatar'])
  }

  async list(uid: string): Promise<Array<Guild>> {
    const result = await this.ctx.database.get('satori-im.member', { user: { id: uid } }, ['guild'])
    return result.map((data) => {
      return data.guild
    })
  }

  async create(data: { name: string }): Promise<Guild> {
    const result = await this.ctx.database.create('satori-im.guild', {
      id: genId(),
      name: data.name,
    })
    return result
  }

  // TODO: permission check.
  async _update(gid: string, data: Partial<Guild>): Promise<void> {
    await this.ctx.database.set('satori-im.guild', gid, {
      name: data.name,
    })
  }

  async _softDel(gid: string): Promise<void> {
    await this.ctx.database.remove('satori-im.guild', gid)
  }

  public Member = {
    fetch: async (uid: string, gid: string): Promise<Member> => {
      const result = await this.ctx.database.get('satori-im.member', (row) =>
        $.and($.eq(row.user.id, uid), $.eq(row.guild.id, gid))
      )
      return result[0]
    },

    list: async (gid: string): Promise<Array<Omit<Member, 'guild'> & { role: Role }>> => {
      const result = await this.ctx.database
        .join(['satori-im.member', 'satori-im.role'], (member, role) =>
          $.eq(member['user.id'], role.user)
        )
        .where((row) => $.eq('guild.id', gid))
        .orderBy('satori-im.member.name', 'asc')
        .project({
          user: (row) => row['satori-im.member'].user,
          role: (row) => row['satori-im.role'],
          name: (row) => row['satori-im.member'].name,
        })
        .execute()
      return result
    },
  }
}
