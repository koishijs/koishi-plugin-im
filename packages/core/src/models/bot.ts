import { createHash } from 'crypto'
import { Context } from '@satorijs/core'
import { Bot, Login } from '../types'

export class BotData {
  constructor(public ctx: Context) {}

  _createBot = async (name: string, password: string) => {
    const crypted = createHash('sha256').update(password).digest('hex')
    await this.ctx.database.create('satori-im.user.auth', {
      user: { id: 'koishi', name, isBot: true },
      password: crypted,
    })
  }

  fetchCommands = async (login: Login, id: string): Promise<Array<Bot.Command>> => {
    return this.ctx.database.get('satori-im.bot.command', { bot: { id } })
  }

  _updateCommands = async (commands: Bot.Command[]) => {
    await this.ctx.database.upsert('satori-im.bot.command', commands)
  }
}
