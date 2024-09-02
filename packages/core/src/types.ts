import { Universal } from '@satorijs/core'
import { Row } from 'minato'

declare module 'minato' {
  interface Tables {
    'satori-im.channel.settings': Channel.Settings
    'satori-im.channel': Channel
    'satori-im.friend.settings': Friend.Settings
    'satori-im.friend': Friend
    'satori-im.guild.settings': Guild.Settings
    'satori-im.guild': Guild
    'satori-im.login': Login
    'satori-im.member': Member
    'satori-im.message.settings': Message.Settings
    'satori-im.message.test': Message
    'satori-im.role': Role
    'satori-im.user.preferences': User.Preferences
    'satori-im.user.auth': User.Auth
    'satori-im.user.settings': User.Settings
    'satori-im.user': User
    'satori-im.notification': Notification
    'satori-im.notification.settings': Notification.Settings
  }
}

export function extractSettings<T extends { settings: S[] }, S>(
  row: Row<T>
): Row.Cell<S> | undefined {
  if (row.settings && row.settings.length > 0) {
    return row.settings[0]
  }
  return undefined
}

export interface Login extends Universal.Login {
  clientId?: string
  selfId?: string
  token: string
  updateAt?: number
  expiredAt?: number
}

export interface Notification {
  id: string
  selfId: string
  shouldReply: boolean
  // type: Notification.Type
  createdAt?: number
  user?: User
  guild?: Guild
  content?: string
  settings?: Array<Notification.Settings>
}

export namespace Notification {
  export interface Type {
    announcement: void
    'bump-version': void
  }

  export interface Settings {
    self: Notification
    user: User
    read: boolean
  }
}

export type EventName = Universal.EventName | 'notification-added'
export interface Event extends Universal.Event {
  type: EventName
  channel?: Channel
  friend?: Friend
  guild?: Guild
  member?: Member
  message?: Message
  notification?: Notification
  role?: Role
  user?: User
}

export interface User extends Universal.User {
  settings?: Array<User.Settings>
  roles?: Array<Role>
  members?: Array<Member>
  deleted?: boolean
}

export namespace User {
  export interface Settings {
    user: User
    target: User
    level: NotifyLevels
  }

  export type Payload = Omit<User & Settings, 'user' | 'target' | 'settings' | 'deleted'>

  export interface Auth {
    user: User
    password: string
  }

  export interface Preferences {
    user: User
  }
}

export interface Friend {
  id: string
  self: User
  target: User
  createdAt?: number
  deleted?: boolean
  settings?: Array<Friend.Settings>
  channel?: Channel
  messages?: Array<Message>
}

export namespace Friend {
  export interface Settings {
    user: User
    friend: Friend
    pinned: boolean
    group?: string
    nick?: string
  }

  export type Payload = Omit<Friend, 'self' | 'target' | 'settings' | 'deleted'> & {
    user: User
    nick?: string
    level: NotifyLevels
    pinned: boolean
    group?: string
  }
}

export interface Guild extends Universal.Guild {
  members?: Array<Member>
  roles?: Array<Role>
  settings?: Array<Guild.Settings>
  channels?: Array<Channel>
  createdAt?: number
  deleted?: boolean
}

export namespace Guild {
  export interface Settings {
    guild: Guild
    user: User
    group: string
    pinned: boolean
  }
  export type Payload = Omit<Guild, 'settings' | 'deleted'> & {
    group?: string
    pinned: boolean
    channels: Array<Channel.Payload>
  }
}

export interface Member extends Universal.GuildMember {
  guild: Guild
  user: User
  createdAt?: number
}

// HACK: related to member instead of user.
export interface Role extends Universal.GuildRole {
  gid: string
  users?: Array<User>
  guild: Guild
}

export interface Channel extends Universal.Channel {
  friend?: Friend
  guild?: Guild
  deleted?: boolean
  settings?: Array<Channel.Settings>
  messages?: Array<Message>
}

export namespace Channel {
  export interface Settings {
    user: User
    channel: Channel
    level: NotifyLevels
    nick?: string
    pinned: boolean
    lastRead: number
  }

  export type Payload = Omit<Channel, 'settings' | 'deleted'> & {
    level: NotifyLevels
    nick?: string
    pinned: boolean
    lastRead?: number
  }

  export import Type = Universal.Channel.Type
}

export interface Message extends Universal.Message {
  sid?: string // message sync id.
  user?: User
  member?: Member
  channel: Channel
  quote?: Message
  deleted?: boolean
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

  export type Direction = 'before' | 'after'

  // 序列化

  // 创建 Message
}

export type IdOnly<T extends { id: any }> = Pick<T, 'id'>

export enum NotifyLevels {
  BLOCKED = 0,
  SILENT = 1,
  NORMAL = 2,
  IMPORTANT = 3,
}

export interface ChunkOptions {
  direction: 'before' | 'after'
  cursor: string
  limit: number
  offset?: number // used when skipping pages.
}

export interface ChunkData {
  current: number
  total: number
  data: Array<{ id: string }>
}
