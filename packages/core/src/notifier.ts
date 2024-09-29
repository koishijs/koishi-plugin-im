import { Context, Dict, Service } from '@satorijs/core'
import { Event, Login } from './types'

export class ImEventService extends Service {
  static inject = ['database', 'im', 'im.auth']
  private currentEventId: number // ?
  eventChans: Dict<Event> = {}

  constructor(public ctx: Context) {
    super(ctx, 'im.event', true)
    this.currentEventId = 1
  }

  pushEvent(event: Omit<Event, 'id' | 'platform' | 'timestamp'>) {
    const data: Event = {
      id: this.currentEventId,
      platform: 'satori-im',
      timestamp: new Date().getTime(),
      ...event,
    }
    this.currentEventId += 1
    this._pushEvent(data)
  }

  private _pushEvent(data: Event) {
    // HACK: directly emit events to the only bot.
    this.ctx.emit('im-message', data)

    const receivers: Dict<boolean> = {}
    if (data.guild) {
      for (let i = 0; i < data.guild.members!.length; i++) {
        receivers[data.guild.members![i].user.id] = true
      }
    } else if (data.friend) {
      receivers[data.friend.self.id] = true
      receivers[data.friend.target.id] = true
    } else if (data.user) {
      receivers[data.user.id] = true
    }
    this.ctx.logger('im.debug').info(data)
    this.ctx.logger('im.debug').info(receivers)

    const logins = this.ctx.im.auth.logins
    const flag: Dict<boolean> = {}

    // TODO: should delete the expired?
    // TODO: fit event size.
    for (const key in logins) {
      const userId = logins[key].user!.id
      const clientId = logins[key].clientId!
      if (receivers[userId]) {
        if (!flag[userId]) {
          this.eventChans[userId] = data
          flag[userId] = true
        }
        this.ctx.inject(['im.entry'], (ctx) => {
          ctx['im.entry'].entry.unicast(clientId, {
            eventChan: this.eventChans[userId],
          })
        })
      }
    }
  }
}
