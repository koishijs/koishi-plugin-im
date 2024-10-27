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
        isBot: {
          type: 'boolean',
          initial: false,
        },
      },
      {
        primary: ['id'],
        unique: ['name'],
      }
    )
    ctx.model.extend(
      'satori-im.user.auth',
      {
        user: {
          type: 'oneToOne',
          table: 'satori-im.user',
          target: 'auth',
        },
        password: {
          type: 'char',
          length: 255,
          nullable: false,
        },
      },
      {
        primary: ['user'],
      }
    )
    ctx.model.extend(
      'satori-im.user.settings',
      {
        user: {
          type: 'manyToOne',
          table: 'satori-im.user',
        },
        target: {
          type: 'manyToOne',
          table: 'satori-im.user',
          target: 'settings',
        },
        level: {
          type: 'unsigned',
          length: 1,
          initial: 2,
        },
      },
      { primary: ['user', 'target'] }
    )
    ctx.model.extend(
      'satori-im.user.preferences',
      {
        user: {
          type: 'manyToOne',
          table: 'satori-im.user',
          target: 'perferences',
        },
      },
      {
        primary: ['user'],
      }
    )
    ctx.model.extend(
      'satori-im.bot.command',
      {
        bot: {
          type: 'manyToOne',
          table: 'satori-im.user',
          target: 'commands',
        },
        'bot.id': 'char(255)',
        'parent.name': 'char(255)',
        name: 'char(255)',
        description: 'json',
        arguments: 'json',
        options: 'json',
      },
      {
        primary: ['bot.id', 'name', 'parent.name'],
      }
    )
    // FIXME: combined unique doesnt support relation.
    ctx.model.extend(
      'satori-im.friend',
      {
        id: 'char(255)',
        'self.id': 'char(255)',
        'target.id': 'char(255)',
        createdAt: 'unsigned(8)',
        deleted: {
          type: 'boolean',
          initial: false,
        },
      },
      {
        primary: ['id'],
        unique: [['self.id', 'target.id']],
      }
    )
    ctx.model.extend(
      'satori-im.friend.settings',
      {
        user: {
          type: 'manyToOne',
          table: 'satori-im.user',
        },
        friend: {
          type: 'manyToOne',
          table: 'satori-im.friend',
          target: 'settings',
        },
        group: 'char(255)',
        pinned: {
          type: 'boolean',
          initial: false,
        },
        nick: 'char(255)',
      },
      {
        primary: ['user', 'friend'],
      }
    )
    ctx.model.extend(
      'satori-im.guild',
      {
        id: 'char(255)',
        name: {
          type: 'char',
          length: 255,
          nullable: false,
        },
        avatar: 'char(255)',
        createdAt: 'unsigned(8)',
        deleted: {
          type: 'boolean',
          initial: false,
        },
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
          table: 'satori-im.guild',
          target: 'settings',
        },
        user: {
          type: 'manyToOne',
          table: 'satori-im.user',
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
          target: 'members',
        },
        name: 'char(255)', // name of member identity
        createdAt: 'unsigned(8)',
      },
      {
        primary: ['guild', 'user'],
      }
    )
    // FIXME: combined unique doesnt support relation.
    ctx.model.extend(
      'satori-im.role',
      {
        id: 'string',
        users: {
          type: 'manyToMany',
          table: 'satori-im.user',
          target: 'roles',
        },
        guild: {
          type: 'manyToOne',
          table: 'satori-im.guild',
          target: 'roles',
        },
        gid: 'char(255)',
        name: {
          type: 'char',
          length: 255,
          nullable: false,
        },
        color: 'integer',
        permissions: 'bigint',
      },
      {
        primary: ['id'],
        unique: [['gid', 'name']],
      }
    )

    ctx.model.extend(
      'satori-im.channel',
      {
        id: 'char(255)',
        name: 'char(255)',
        type: 'unsigned(1)',
        parentId: 'char(255)',
        friend: {
          type: 'oneToOne',
          table: 'satori-im.friend',
          target: 'channel',
        }, // FIXME: doesnt work.
        guild: {
          type: 'manyToOne',
          table: 'satori-im.guild',
          target: 'channels',
        },
        deleted: {
          type: 'boolean',
          initial: false,
        },
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
        },
        channel: {
          type: 'manyToOne',
          table: 'satori-im.channel',
          target: 'settings',
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
        lastRead: {
          type: 'unsigned',
          length: 8,
          initial: new Date().getTime(),
        },
      },
      {
        primary: ['channel', 'user'],
      }
    )
    ctx.model.extend(
      'satori-im.message.test',
      {
        id: 'char(255)',
        user: {
          type: 'manyToOne',
          table: 'satori-im.user',
        },
        channel: {
          type: 'manyToOne',
          table: 'satori-im.channel',
          target: 'messages',
        },
        'quote.id': 'string',
        content: 'text',
        createdAt: 'unsigned(8)',
        updatedAt: 'unsigned(8)',
        deleted: {
          type: 'boolean',
          initial: false,
        },
      },
      {
        primary: ['id'],
      }
    )
    ctx.model.extend(
      'satori-im.message.settings',
      {
        user: {
          type: 'manyToOne',
          table: 'satori-im.user',
        },
        message: {
          type: 'manyToOne',
          table: 'satori-im.message.test',
          target: 'settings',
        },
      },
      { primary: ['message', 'user'] }
    )
    ctx.model.extend(
      'satori-im.login',
      {
        token: 'char(255)',
        clientId: 'char(255)',
        selfId: 'char(255)',
        status: 'unsigned(1)',
        updateAt: 'unsigned(8)',
        expiredAt: 'unsigned(8)',
      },
      {
        primary: ['token'],
      }
    )
    ctx.model.extend(
      'satori-im.notification',
      {
        id: 'char(255)',
        selfId: 'char(255)',
        user: {
          type: 'manyToOne',
          table: 'satori-im.user',
          target: 'notifications',
        },
        guild: {
          type: 'manyToOne',
          table: 'satori-im.guild',
        },
        shouldReply: 'boolean',
        content: 'char(255)',
        createdAt: 'unsigned(8)',
      },
      {
        primary: ['id'],
        autoInc: true,
      }
    )
    ctx.model.extend(
      'satori-im.notification.settings',
      {
        self: {
          type: 'manyToOne',
          table: 'satori-im.notification',
          target: 'settings',
        },
        user: {
          type: 'manyToOne',
          table: 'satori-im.user',
        },
        read: 'boolean',
      },
      {
        primary: ['self', 'user'],
      }
    )
  }
}
