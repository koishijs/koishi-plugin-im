import { Context } from '@satorijs/core'

export default class ImDatabase {
  constructor(public ctx: Context) {
    ctx.model.extend(
      'satori-im.user',
      {
        id: 'char(255)',
        name: {
          type: 'char',
          length: 255,
          nullable: false,
        },
        nick: 'char(255)',
        avatar: 'char(255)',
        password: {
          type: 'char',
          length: 255,
          nullable: false,
        },
      },
      {
        primary: ['id'],
        unique: ['name'],
      }
    )
    ctx.model.extend(
      'satori-im.user.settings',
      {
        origin: {
          type: 'manyToOne',
          table: 'satori-im.user',
          target: 'settings.user',
        },
        target: {
          type: 'manyToOne',
          table: 'satori-im.user',
        },
        level: {
          type: 'unsigned',
          length: 1,
          initial: 2,
        },
      },
      { primary: ['origin', 'target'] }
    )
    ctx.model.extend(
      'satori-im.friend',
      {
        origin: {
          type: 'manyToOne',
          table: 'satori-im.user',
        },
        target: {
          type: 'manyToOne',
          table: 'satori-im.user',
          target: 'friends',
        },
        group: 'char(255)',
        pinned: {
          type: 'boolean',
          initial: false,
        },
        nick: 'char(255)',
      },
      {
        primary: ['origin', 'target'],
      }
    )
    ctx.model.extend(
      'satori-im.guild',
      {
        id: 'char(255)',
        name: {
          type: 'string',
          length: 255,
          nullable: false,
        },
        avatar: 'char(255)',
      },
      {
        primary: ['id'],
      }
    )
    ctx.model.extend(
      'satori-im.guild.settings',
      {
        guild: {
          type: 'manyToOne',
          table: 'satori-im.user',
          target: 'settings.guild',
        },
        user: {
          type: 'manyToOne',
          table: 'satori-im.guild',
        },
        group: 'char(255)',
        pinned: 'boolean',
      },
      {
        primary: ['guild', 'user'],
      }
    )
    ctx.model.extend(
      'satori-im.member',
      {
        guild: {
          type: 'manyToOne',
          table: 'satori-im.guild',
          target: 'members',
        },
        user: {
          type: 'manyToOne',
          table: 'satori-im.user',
        },
        name: 'char(255)', // name of member identity
      },
      {
        primary: ['guild', 'user'],
      }
    )
    ctx.model.extend(
      'satori-im.role',
      {
        id: 'char(255)',
        user: {
          type: 'manyToMany',
          table: 'satori-im.user',
          target: 'roles',
        },
        // guild: {
        //   type: 'manyToOne',
        //   table: 'satori-im.guild',
        //   target: 'roles',
        //   nullable: false,
        // },
        'guild.id': 'char(255)',
        name: {
          type: 'string',
          length: 255,
          nullable: false,
        },
        color: 'integer',
        position: 'integer',
        permissions: 'bigint',
        hoist: 'boolean',
        mentionable: 'boolean',
      },
      {
        primary: ['id'],
        unique: [['guild.id', 'name']],
      }
    )
    ctx.model.extend(
      'satori-im.message.test',
      {
        id: 'char(255)',
        'user.id': 'char(255)',
        'channel.id': 'char(255)',
        'guild.id': 'char(255)',
        'quote.id': 'char(255)',
        content: 'text',
        createdAt: 'unsigned(8)',
        updatedAt: 'unsigned(8)',
      },
      {
        primary: ['id'],
      }
    )
    ctx.model.extend(
      'satori-im.message.settings',
      {
        message: {
          type: 'manyToOne',
          table: 'satori-im.message.test',
        },
        user: {
          type: 'manyToOne',
          table: 'satori-im.user',
          target: 'settings.message',
        },
      },
      { primary: ['message', 'user'] }
    )
    ctx.model.extend(
      'satori-im.channel',
      {
        id: 'char(255)',
        name: 'char(255)',
        type: 'unsigned(1)',
        parentId: 'char(255)',
      },
      {
        primary: ['id'],
      }
    )
    ctx.model.extend(
      'satori-im.channel.settings',
      {
        user: {
          type: 'manyToOne',
          table: 'satori-im.user',
          target: 'settings.channel',
        },
        channel: {
          type: 'manyToOne',
          table: 'satori-im.channel',
        },
        pinned: {
          type: 'boolean',
          initial: false,
        },
        level: {
          type: 'unsigned',
          length: 1,
          initial: 0,
        },
        lastRead: 'char(255)',
      },
      {
        primary: ['channel', 'user'],
      }
    )
    ctx.model.extend(
      'satori-im.login',
      {
        user: {
          type: 'manyToOne',
          table: 'satori-im.user',
          target: 'logins',
        },
        status: 'unsigned(1)',
        updateAt: 'unsigned(8)',
      },
      {
        primary: ['user'],
      }
    )
    ctx.model.extend('satori-im.notification', {
      self: {
        type: 'manyToOne',
        table: 'satori-im.user',
      },
      user: {
        type: 'manyToOne',
        table: 'satori-im.user',
      },
      'guild.id': 'char(255)',
      type: 'unsigned(0)',
    })
  }
}
