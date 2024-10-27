import { Bot, Context, Fragment, h, Schema, Universal } from '@satorijs/core'
import { SendOptions } from '@satorijs/protocol'
import { Im } from '@satorijs/plugin-im'

// TODO: implement ImMessageDecoder.
export class ImBot<C extends Context> extends Bot<C, ImBot.Config> {
  static inject = ['im.data', 'im.auth', 'im']

  private login: Im.Login | null = null

  async getUser(userId: string) {
    return this.ctx['im.data'].user.fetch(this.login!, userId)
  }

  async getLogin(): Promise<Universal.Login> {
    if (this.config.type === 'token') {
      this.login = await this.ctx['im.auth'].authenticateWithToken({
        token: this.config.token,
      } as any)
    } else {
      this.login = await this.ctx['im.auth'].authenticate(
        this.config.name,
        this.config.password,
        this.selfId
      )
    }

    this.user = this.login?.user!

    return this.login!
  }

  async dispose() {
    await this.ctx['im.auth'].logout(this.login)
  }

  async getGuild(guildId: string) {
    const data = await this.ctx['im.data'].guild.fetch(this.login!, guildId)
    return data
  }

  async getGuildList() {
    const data = await this.ctx['im.data'].guild.list(this.login!)
    return {
      data,
    }
  }

  async getChannel(channelId: string) {
    return this.ctx['im.data'].channel.fetch(this.login!, channelId)
  }

  async getGuildMember(guildId: string, userId: string) {
    return this.ctx['im.data'].guild.Member.fetch(this.login!, guildId, userId)
  }

  async getGuildMemberList(guildId: string) {
    const data = await this.ctx['im.data'].guild.Member.list(this.login!, guildId)
    return {
      data,
    }
  }

  async createChannel(
    guildId: string,
    data: Partial<Universal.Channel>
  ): Promise<Universal.Channel> {
    if (!data.name) throw new Error('name is required.')
    return this.ctx['im.data'].channel.create(this.login!, guildId, data.name)
  }

  async updateChannel(guildId: string, data: Partial<Universal.Channel>) {
    await this.ctx['im.data'].channel.update(this.login!, guildId, data.name)
  }

  async deleteChannel(channelId: string) {
    await this.ctx['im.data'].channel.softDel(this.login!, channelId)
  }

  async muteChannel(channelId: string) {
    await this.ctx['im.data'].channel.updateSettings(this.login, channelId, {
      level: Im.NotifyLevels.BLOCKED,
    })
  }

  async handleFriendRequest(messageId: string, approve: boolean, comment?: string) {
    await this.ctx['im.data'].notification.reply(this.login!, messageId, approve)
  }

  async handleGuildMemberRequest(messageId: string, approve: boolean, comment?: string) {
    await this.ctx['im.data'].notification.reply(this.login!, messageId, approve)
  }

  async kickGuildMember(guildId: string, userId: string) {
    await this.ctx['im.data'].guild.Member.kick(this.login!, guildId, userId)
  }

  // TODO:
  async getGuildRoleList(guildId: string, next?: string) {
    const data = await this.ctx['im.data'].guild.Role.list(this.login!, guildId)

    return {
      data,
    }
  }

  async createGuildRole(guildId: string, data: Partial<Universal.GuildRole>) {
    if (!data.name || !data.color) throw new Error('')
    const res = await this.ctx['im.data'].guild.Role.create(
      this.login!,
      guildId,
      data.name!,
      data.color!
    )
    return res
  }

  async updateGuildRole(guildId: string, roleId: string, data: Partial<Universal.GuildRole>) {}

  async deleteGuildRole(guildId: string, roleId: string) {
    await this.ctx['im.data'].guild.Role.hardDel(this.login!, guildId, roleId)
  }

  setGuildMemberRole(guildId: string, userId: string, roleId: string) {
    return this.ctx['im.data'].guild.Role.set(this.login!, roleId, userId)
  }

  unsetGuildMemberRole(guildId: string, userId: string, roleId: string) {
    return this.ctx['im.data'].guild.Role.unset(this.login!, roleId, userId)
  }

  // TODO:
  async getMessageList(
    channelId: string,
    messageId?: string,
    direction: Universal.Direction = 'before',
    limit?: number,
    order: Universal.Order = 'asc'
  ) {
    const messages = await this.ctx['im.data'].message.fetch(this.login!, channelId)
    return messages
  }

  // TODO:
  async sendMessage(
    channelId: string,
    content: h.Fragment,
    guildId?: string,
    options?: SendOptions
  ) {
    let guild: Im.Guild | undefined = guildId ? { id: guildId } : undefined
    await this.ctx['im.data'].message.create(this.login!, {
      content: content as string,
      guild,
      channel: { id: channelId } as Im.Channel,
    })
    return []
  }

  // HACK: No use of guildId.
  async sendPrivateMessage(
    userId: string,
    content: h.Fragment,
    guildId?: string,
    options?: SendOptions
  ) {
    const channel = (await this.ctx['im.data'].friend.fetch(this.login!, userId))?.channel
    if (!channel) {
      throw new Error('no permission to send private message to selected user.')
    }
    await this.ctx['im.data'].message.create(this.login!, {
      content: content as string,
      channel: { id: channel.id } as Im.Channel,
    })

    return []
  }

  // TODO: how we resolve the satori element to im message?
  async editMessage(channelId: string, messageId: string, content: Fragment) {
    await this.ctx['im.data'].message.update(this.login!, channelId, messageId, content as string)
  }

  async deleteMessage(channelId: string, messageId: string) {
    await this.ctx['im.data'].message.softDel(this.login!, channelId, messageId)
  }

  async updateCommands(commands: Universal.Command[]): Promise<void> {
    await this.ctx['im.data'].bot._updateCommands(commands)
  }
}

export namespace ImBot {
  export interface Config {
    type: 'token' | 'password'
    name: string
    password: string
    token: string
  }

  export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
      type: Schema.union(['token', 'password']).default('password').description('登录方式'),
    }),
    Schema.union([
      Schema.object({
        type: Schema.const('token').required(),
        token: Schema.string().description('Bot 用户令牌。').role('secret').required(),
      }),
      Schema.object({
        type: Schema.const('password'),
        name: Schema.string().description('Bot 用户名称').required(),
        password: Schema.string().description('Bot 登录所用的密码').role('secret').required(),
      }),
    ]),
  ]) as any
}
