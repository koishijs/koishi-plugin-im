import { Context, Service } from '@satorijs/core'

export class ImDataService extends Service {
  static inject = ['model', 'database', 'webui']

  constructor(public ctx: Context) {
    super(ctx, 'im.data', true)
  }
}
