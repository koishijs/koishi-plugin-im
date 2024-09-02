import { $ } from 'minato'
import { Context } from '@satorijs/core'
import { Channel, Guild, Login, Member, Role, ChunkOptions, extractSettings } from '../types'
import { genId } from '@satorijs/plugin-im-utils'

export class GuildData {
  constructor(public ctx: Context) {}

  fetch = async (login: Login, gid: string): Promise<Guild> => {
    const result = await this.ctx.database
      .select(
        'satori-im.guild',
        {
          id: gid,
          members: {
            $some: (row) => $.eq(row.user.id, login.selfId!),
          },
          channels: {
            $some: {
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
          },
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
          channels: true,
          settings: true,
          members: true,
        }
      )
      .execute()

    return result[0]
  }

  _fetch = async (gid: string): Promise<Guild> => {
    const result = await this.ctx.database
      .select(
        'satori-im.guild',
        {
          id: gid,
        },
        {
          members: true,
          settings: true,
          channels: true,
        }
      )
      .execute()
    return result[0]
  }

  list = async (login: Login): Promise<Array<Guild>> => {
    const result = await this.ctx.database.get('satori-im.guild', {
      members: {
        $some: (row) => $.eq(row.user.id, login.selfId!),
      },
      channels: {
        $some: {
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
      },
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
    })
    return result as any
  }

  create = async (
    login: Login,
    name: string,
    options: { inviteUsers?: string[]; initialChannelName?: string }
  ): Promise<Guild> => {
    const selfId = login.selfId!
    const timestamp = new Date().getTime()
    const result: Guild = await this.ctx.database.transact(async (db): Promise<Guild> => {
      const result = await db.create('satori-im.guild', {
        id: genId(),
        name,
        createdAt: timestamp,
      })
      const owner = await db.create('satori-im.member', {
        guild: result,
        user: { $connect: { id: selfId } },
      })
      const role = await db.create('satori-im.role', {
        id: genId(),
        name: '$a',
        guild: { $connect: { id: result.id } },
        gid: result.id,
        users: { $connect: { id: selfId } },
      })
      const channel = await db.create('satori-im.channel', {
        id: genId(),
        parentId: result.id,
        guild: { $connect: { id: result.id } },
        name: options.initialChannelName ? options.initialChannelName : '主要频道',
      })

      return {
        ...result,
        members: [
          {
            ...owner,
            roles: [role as any],
          },
        ],
        channels: [channel],
      }
    })

    if (options.inviteUsers) {
      const toInvite = options.inviteUsers
      for (let i = 0; i < toInvite.length; i++) {
        const friend = await this.ctx.database.get('satori-im.friend', (row) =>
          $.or(
            $.and($.eq(row.self.id, login.selfId!), $.eq(row.target.id, toInvite[i])),
            $.and($.eq(row.target.id, login.selfId!), $.eq(row.self.id, toInvite[i]))
          )
        )
        if (friend) {
          this.ctx.im.data.notification.request(login, toInvite[i], '', result.id)
        }
      }
    }

    this.ctx['im.event'].pushEvent({
      selfId: login.selfId!,
      type: 'guild-added',
      guild: result,
    })
    return result
  }

  update = async (login: Login, gid: string, name: string) => {
    const result = await this.ctx.database.set('satori-im.guild', gid, {
      name,
    })
    if (!result.matched) {
      throw new Error()
    }
    if (!result.modified) {
      throw new Error()
    }
    this.ctx['im.event'].pushEvent({
      type: 'guild-updated',
      selfId: login.selfId!,
      guild: { id: gid, name } as Guild,
    })
  }

  _update = async (gid: string, data: { name?: string; avatarUrl?: string }) => {
    const result = await this.ctx.database.set(
      'satori-im.guild',
      { id: gid },
      {
        name: data.name,
        avatar: data.avatarUrl,
      }
    )
    if (!result.matched) {
      throw new Error()
    }
    const guild = await this._fetch(gid)
    this.ctx['im.event'].pushEvent({
      type: 'guild-updated',
      selfId: '',
      guild,
    })
  }

  softDel = async (login: Login, gid: string) => {
    this.ctx.database.transact(async (db) => {
      await db.set('satori-im.guild', gid, { deleted: true })
      await db.remove('satori-im.guild.settings', {
        guild: { id: gid },
      })
      await db.set(
        'satori-im.channel',
        {
          parentId: gid,
          type: { $not: Channel.Type.DIRECT },
        },
        {
          deleted: true,
        }
      )
      await db.remove('satori-im.channel.settings', {
        channel: { parentId: gid, type: { $not: Channel.Type.DIRECT } },
      })
    })
    this.ctx['im.event'].pushEvent({
      type: 'guild-deleted',
      selfId: login.selfId!,
      guild: { id: gid } as Guild,
    })
  }

  // HACK: shouldnt get guilds which the user has joined.
  search = async (
    login: Login,
    keyword: string,
    options: ChunkOptions & { except: Array<string> }
  ): Promise<Array<Guild>> => {
    const keywordRegex = new RegExp(`${keyword}`, 'i')
    let query = this.ctx.database
      .select('satori-im.guild')
      .where((row) =>
        $.and(
          $.or($.eq(row.id, keyword), $.regex(row.name, keywordRegex)),
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
    if (options.offset) {
      query = query.offset(options.offset)
    }
    return query.limit(options.limit).execute()
  }

  async _isGuildMember(gid: string, uid: string): Promise<boolean> {
    const result = await this.ctx.database.get('satori-im.member', {
      guild: { id: gid },
      user: { id: uid },
    })
    return result.length ? true : false
  }

  async _isAuthorized(gid: string, uid: string): Promise<boolean> {
    // TODO:
    return true
  }

  public Member = {
    fetch: async (login: Login, gid: string, uid: string): Promise<Member> => {
      if (!(await this._isGuildMember(gid, login.selfId!)))
        return { e: 'unauthorized' } as any as Member

      const result = await this.ctx.database
        .select(
          'satori-im.member',
          {
            user: {
              id: uid,
              roles: {
                $or: [
                  {
                    $some: (row) => $.eq(row.guild.id, gid),
                  },
                  {
                    $none: {},
                  },
                ],
              },
            },
            guild: { id: gid },
          },
          {
            user: {
              roles: true,
            },
          }
        )
        .project({
          name: (row) => row.name,
          roles: (row) => row.user.roles,
          guild: (row) => row.guild,
          user: (row) => row.user,
        })
        .execute()

      return result[0] as any
    },

    list: async (login: Login, gid: string): Promise<Array<Member>> => {
      if (!(await this._isGuildMember(gid, login.selfId!)))
        return { e: 'unauthorized' } as any as Array<Member>

      const result = await this.ctx.database
        .select(
          'satori-im.member',
          {
            user: {
              roles: {
                $or: [
                  {
                    $some: {
                      guild: { id: gid },
                    },
                  },
                  {
                    $none: {
                      guild: { id: gid },
                    },
                  },
                ],
              },
            },
            guild: { id: gid },
          },
          {
            user: {
              roles: true,
            },
          }
        )
        .project({
          name: (row) => row.name,
          roles: (row) => row.user.roles,
          guild: (row) => row.guild,
          user: (row) => row.user,
        })
        .execute()
      return result as any
    },

    // TODO: Update member.role.
    update: async (login: Login, gid: string, uid?: string, name?: string) => {
      const result = await this.ctx.database.set(
        'satori-im.member',
        {
          guild: { id: gid },
          user: { id: login.selfId },
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
      this.ctx['im.event'].pushEvent({
        type: 'guild-member-updated',
        selfId: login.selfId!,
        member: {
          guild: { id: gid },
          user: { id: login.selfId! },
          name: name,
        },
      })
    },

    kick: async (login: Login, gid: string, uid: string) => {
      const result = await this.ctx.database.remove('satori-im.member', {
        guild: { id: gid },
        user: { id: uid },
      })
      if (!result.matched) {
        throw new Error()
      }
      if (!result.removed) {
        throw new Error()
      }
      this.ctx['im.event'].pushEvent({
        type: 'guild-member-deleted',
        selfId: login.selfId!,
        member: {
          guild: { id: gid },
          user: { id: login.selfId! },
        },
      })
    },
  }

  public Role = {
    fetch: async (login: Login, gid: string, rid: string): Promise<Role> => {
      const result = await this.ctx.database.get('satori-im.role', rid)
      return result[0]
    },

    list: async (login: Login, gid: string): Promise<Array<Role>> => {
      const result = await this.ctx.database.get('satori-im.role', {
        guild: { id: gid },
      })
      return result
    },

    create: async (
      login: Login,
      gid: string,
      uid: string,
      name: string,
      color: number
    ): Promise<Role> => {
      const result = await this.ctx.database.create('satori-im.role', {
        id: genId(),
        guild: { id: gid },
        gid,
        users: [{ id: uid }],
        name,
        color,
      })
      return result
    },

    // TODO: Add authority.
    update: async (login: Login, rid: string, name?: string, color?: number) => {
      const result = await this.ctx.database.set('satori-im.role', rid, {
        name,
        color,
      })
      if (!result.matched) {
        throw new Error()
      }
      if (!result.modified) {
        throw new Error()
      }
    },

    hardDel: async (login: Login, rid: string) => {
      const result = await this.ctx.database.remove('satori-im.role', rid)
      if (!result.matched) {
        throw new Error()
      }
      if (!result.removed) {
        throw new Error()
      }
    },
  }
}
