import { createHash } from 'crypto'
import { Context, Dict, Service, Universal } from '@satorijs/core'

import { Login, User } from './types'
import { genId, validate } from '@satorijs/plugin-im-utils'

export default class ImAuthService extends Service {
  static inject = ['model', 'database']
  public logins: Dict<Login> = {}

  constructor(public ctx: Context) {
    super(ctx, 'im.auth', true)
    ctx.on('ready', this._load)
    ctx.on('exit', this._save)
    ctx.on('dispose', this._save)
  }

  authenticate = async (name: string, password: string, clientId: string): Promise<Login> => {
    const result = await this.ctx.database
      .select(
        'satori-im.user.auth',
        {
          user: { name: name },
          password: this._toHash(password),
        },
        {
          user: true,
        }
      )
      .execute()
    if (result.length === 0) {
      throw Error()
    }
    const user = result[0].user
    const token = this._generateToken()
    const login = {
      user,
      token,
      clientId: clientId,
      status: Universal.Status.ONLINE,
      updateAt: new Date().getTime(),
      expiredAt: new Date().getTime() + ImLoginService.options.tokenExpiration,
    } as Login
    this.logins[token] = login
    this.ctx.logger('im').info(`new account signed in. name: ${login.user!.name}`)
    return login
  }

  authenticateWithToken = async (login: Login): Promise<Login> => {
    const result = await this._verifyToken(login.token)
    result.clientId = login.clientId
    this.ctx.logger('im').info(`new account signed in with token. name: ${result.user!.name}`)
    return result
  }

  register = async (name: string, password: string): Promise<string> => {
    if (
      !this._validate('name', name) ||
      !this._validate('password', password) ||
      !(await this.isNameUnique(name))
    ) {
      throw Error()
    }
    const id = genId()
    const { password: _, ...result } = await this.ctx.database.create('satori-im.user.auth', {
      user: { id, name: name },
      password: this._toHash(password),
    })
    this.ctx.logger('im').info(`new account signed up. name: ${name}, id: ${id}`)
    return name
  }

  logout = async (login: Login): Promise<void> => {
    await this.ctx.database.remove('satori-im.login', { token: login.token })
    delete this.logins[login.token]
  }

  isNameUnique = async (name: string): Promise<boolean> => {
    const result = await this.ctx.database.get('satori-im.user', { name })
    if (result.length) {
      return false
    }
    return true
  }

  async _verifyToken(token: string): Promise<Login> {
    const result = this.logins[token]
    if (!result || result.expiredAt! < new Date().getTime()) {
      if (result) {
        this.ctx.database.remove('satori-im.login', { token: token }).then((data) => {
          if (!data.removed) {
          }
        })
        throw Error('token expired')
      }
      throw Error('no token matched')
    }
    return result
  }

  private _validate = validate

  private _load = async (): Promise<void> => {
    const result = await this.ctx.database.select('satori-im.login').execute()
    result.map((record) => (this.logins[record.token] = record))
    this.ctx.logger('im').info(`loaded authorized clients, ${result.length} record(s) in total. `)
  }

  private _save = async (): Promise<void> => {
    const result = await this.ctx.database.upsert('satori-im.login', Object.values(this.logins))
    if (!result.inserted) {
      throw new Error()
    }
    this.ctx.logger('im').info(`saved authorized clients.`)
  }

  private _generateToken(length = 16): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return new Array(length)
      .fill(0)
      .map(() => characters[Math.floor(Math.random() * characters.length)])
      .join('')
  }

  private _toHash(password: string): string {
    return createHash('sha256').update(password).digest('hex')
  }
}

export namespace ImLoginService {
  export const options = {
    tokenExpiration: 7 * 24 * 60 * 60 * 1000,
  }
}
