import { Context, Dict, Service } from '@satorijs/core'
import { FriendData, GuildData } from './models'
import { Event, Notification } from './types'

declare module '@cordisjs/plugin-webui' {
  interface Events {
    'im/v1/invitation/friend'(uid: string, target: string, content?: string): Promise<void>
    'im/v1/invitation/member'(
      uid: string,
      gid: string,
      target: string,
      content?: string
    ): Promise<void>
    'im/v1/invitation/reply'(uid: string, originId: string, reply: boolean): Promise<void>
  }
}

export class ImEventService extends Service {
  static inject = ['model', 'database', 'webui']
  private _chans: {
    notification: Dict<Array<Notification>>
    event: Dict<Event>
  }

  constructor(public ctx: Context) {
    super(ctx, 'im.event', true)
    this._chans = { notification: {}, event: {} }

    ctx.webui.addListener('im/v1/invitation/friend', this.request)
    ctx.webui.addListener('im/v1/invitation/member', this.request)
    ctx.webui.addListener('im/v1/invitation/reply', this.reply)
  }

  request = async (uid: string, target: string, gid?: string, content?: string) => {
    const invitation = { self: { id: uid }, user: { id: target }, guild: { id: gid } }
    // this._notificationChan[uid].push(...this.notifications[uid])
  }

  reply = async (uid: string, origin: string, reply: boolean, gid?: string) => {
    const invitations = this._chans.notification[origin]
    if (!invitations) {
      throw Error()
    }
    const index = invitations.findIndex(
      (value) => (gid === undefined || value.guild.id === gid) && value.user.id === uid
    )
    if (index === -1) {
      throw Error()
    }
    if (reply === true) {
      gid
        ? await this.ctx.database.create('satori-im.member', {
            user: { id: uid },
            guild: { id: gid },
          })
        : await this.ctx.database.create('satori-im.friend', {
            origin: { id: origin },
            target: { id: uid },
          }) // TODO
    }
    invitations.splice(index, 1)
  }
}
