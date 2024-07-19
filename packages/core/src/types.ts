import { Universal } from '@satorijs/core'

declare module 'minato' {
  interface Tables {
    'satori-im.channel.settings': Channel.Settings
    'satori-im.channel': Channel
    'satori-im.friend': Friend
    'satori-im.guild.settings': Guild.Settings
    'satori-im.guild': Guild
    'satori-im.login': Login
    'satori-im.member': Member
    'satori-im.message.settings': Message.Settings
    'satori-im.message.test': Message
    'satori-im.role': Role
    'satori-im.user.settings': User.Settings
    'satori-im.user': User
    'satori-im.notification': Notification
  }
}

declare module '@satorijs/protocol' {
  interface Message {
    sid?: bigint
  }
}

export interface Login extends Universal.Login {
  user: User
  updateAt: number
}

export interface Notification {
  self: User
  type: Notification.Types
  user: User
  guild: Guild
  content?: string
}

export namespace Notification {
  export enum Types {
    NOT = 0,
    REQ = 1,
  }
}

export type Event = Universal.Event

export interface User extends Universal.User {
  password?: string
}

export namespace User {
  export interface Settings {
    origin: User
    target: User
    level: NotifyLevels
  }
}

export interface Friend {
  id: string
  origin: User
  target: User
  group: string
  pinned: boolean
  nick?: string
}

export interface Guild extends Universal.Guild {}

export namespace Guild {
  export interface Settings {
    guild: Guild
    user: User
    group: string
    pinned: boolean
  }
}

export interface Member extends Universal.GuildMember {
  guild: Guild
  user: User
}

export interface Role extends Universal.GuildRole {
  user: User
  guild: Guild
}

export interface Channel extends Universal.Channel {}

export namespace Channel {
  export interface Settings {
    user: User
    channel: Channel
    level: NotifyLevels
    nick?: string
    pinned: boolean
    lastRead: string
  }
}

export interface Message extends Universal.Message {
  sid?: bigint // message sync id.
  // type: Message.Type
  flag: number
}

export namespace Message {
  export interface Settings {
    message: Message
    user: User
  }

  export enum Flag {
    FRONT = 1,
    BACK = 2,
    FINAL = 4,
  }

  /** @deprecated */
  export enum Types {
    PLAIN = 1,
  }

  // 序列化

  // 创建 Message
}

export enum NotifyLevels {
  BLOCKED = 0,
  SILENT = 1,
  NORMAL = 2,
  IMPORTANT = 3,
}
