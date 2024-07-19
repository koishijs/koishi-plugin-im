import { Context, Dict, Service, Universal } from '@satorijs/core'
import { Login, User } from './types'
import { UserData } from './models'
import { genId, CharValidator } from './utils'

declare module '@cordisjs/plugin-webui' {
  interface Events {
    'im/v1/user/login-add'(data: { name: string; password: string }): Promise<User>
    'im/v1/user/login-change'(data: { uid: string; status: number }): Promise<void>
    'im/v1/user/login-remove'(uid: string): Promise<void>
    'im/v1/user/register'(data: { name: string; password: string }): Promise<User>
  }
}

// TODO: password crypt?
export class ImLoginService extends Service {
  static inject = ['model', 'database', 'webui']
  public cache: Dict<Login> = {}

  constructor(public ctx: Context) {
    super(ctx, 'im.login', true)

    ctx.webui.addListener('im/v1/user/login-add', this.accessibility)
    ctx.webui.addListener('im/v1/user/login-change', this.sync)
    ctx.webui.addListener('im/v1/user/login-remove', this.logout)
    ctx.webui.addListener('im/v1/user/register', this.register)
    // ctx.on('dispose', this._save())
  }

  validate = new CharValidator().validate

  accessibility = async (data: { name: string; password: string }): Promise<User> => {
    const result = await this.ctx.database.get('satori-im.user', data)
    if (result.length === 0) {
      throw Error()
    }
    this.cache[result[0].id] = {
      user: result[0],
      status: Universal.Status.ONLINE,
      updateAt: new Date().getTime(),
      features: [],
      proxyUrls: [],
    }
    return result[0]
  }

  register = async (data: { name: string; password: string }): Promise<User> => {
    const user = { id: genId(), ...data }
    const { password: _, ...result } = await this.ctx.database.create('satori-im.user', user)
    return result
  }

  sync = async (data: { uid: string; status: number }) => {}

  async logout(uid: string): Promise<void> {
    delete this.cache[uid]
  }
}
