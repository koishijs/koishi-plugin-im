import { Context, Service } from '@satorijs/core'
import ImDatabase from './database'
import { ImAuthService } from './auth'
import ImDataService from './data'
import { ImEventService } from './notifier'
import { Event } from './types'

export * as Im from './types'

declare module 'cordis' {
  interface Context {
    im: Im
    'im.data': ImDataService
    'im.event': ImEventService
    'im.auth': ImAuthService
  }
}

declare module '@satorijs/core' {
  interface Events {
    'exit'(signal: NodeJS.Signals): Promise<void>
    'im-message'(event: Event): Promise<void>
  }
}

interface Im {
  data: ImDataService
  event: ImEventService
  auth: ImAuthService
}

class Im extends Service {
  constructor(public ctx: Context) {
    super(ctx, 'im', true)
    new ImDatabase(ctx)
    ctx.plugin(ImDataService)
    ctx.plugin(ImEventService)
    ctx.plugin(ImAuthService)
  }
}
export default Im
