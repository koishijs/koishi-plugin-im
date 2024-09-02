import { Context, Service } from '@satorijs/core'

class ImDataService extends Service<ImDataService.Config> {
  static inject = ['server', 'model', 'database'] // FIXME: self injection

  constructor(public ctx: Context) {
    super(ctx, 'im.data', true)
  }
}
