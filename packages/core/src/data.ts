import mime from 'mime-types'
import fs from 'fs/promises'
import path from 'path'
import { Context, Service, Schema } from '@satorijs/core'
import {} from '@cordisjs/plugin-server'
import * as Model from './models'
import { Login } from './types'
import { genId } from '@satorijs/plugin-im-utils'

class ImDataService extends Service<ImDataService.Config> {
  static inject = ['server', 'model', 'database'] // FIXME: self injection

  user: Model.UserData
  friend: Model.FriendData
  guild: Model.GuildData
  channel: Model.ChannelData
  message: Model.MessageData
  notification: Model.NotificationData

  constructor(public ctx: Context, public config: ImDataService.Config) {
    super(ctx, 'im.data', true)

    // TODO: need better injections.
    this.user = new Model.UserData(this.ctx)
    this.friend = new Model.FriendData(this.ctx)
    this.guild = new Model.GuildData(this.ctx)
    this.channel = new Model.ChannelData(this.ctx)
    this.message = new Model.MessageData(this.ctx)
    this.notification = new Model.NotificationData(this.ctx)

    ctx.server.get('/im/v1/proxy/:url(.+)', async (koa) => {
      const filePath = path.resolve(path.join(this.config.assetPath, koa.params.url))

      try {
        const fileContent = await fs.readFile(filePath)
        koa.set(
          'Content-Type',
          mime.contentType(path.extname(filePath)) || 'application/octet-stream'
        )
        koa.body = fileContent
        koa.status = 200
      } catch {
        koa.status = 404
      }
    })
  }

  writeAvatar = async (login: Login, b64: string, gid?: string) => {
    let id = login.selfId
    if (gid) {
      if (!(await this.guild._isAuthorized(gid, login.selfId!))) {
        throw new Error()
      }
      id = gid
    }

    const mType = b64.match(/^data:(.*?);base64,/)
    if (!mType) throw Error()

    const ext = mime.extension(mType[1])
    const filePath = path.join('avatars', `${gid ? 'g' : 'u'}-${login.selfId}.${ext}`)
    const filePathAbsolute = path.join(this.config.assetPath, filePath)

    const fileData = b64.split('base64,')[1]
    await fs.mkdir(path.dirname(filePathAbsolute), { recursive: true })
    await fs.writeFile(filePathAbsolute, Buffer.from(fileData, 'base64'))

    const urlPath = encodeURI(filePath.replace(/\\/g, '/'))

    gid
      ? await this.guild._update(gid, { avatarUrl: urlPath })
      : await this.user._update(login.selfId!, { avatarUrl: urlPath })

    return urlPath
  }

  // TODO:
  writeFile = async (login: Login, b64: string) => {
    const mType = b64.match(/^data:(.*?);base64,/)
    if (!mType) throw Error()
    const ext = mime.extension(mType[1])
    const filePath = path.join(this.config.assetPath, 'messages')

    await fs.mkdir(filePath, { recursive: true })
    await fs.writeFile(
      filePath + `/${genId()}-${login.selfId}.tmp.${ext}`,
      Buffer.from(b64, 'base64')
    )

    return `${this.ctx.server.selfUrl}/${filePath}`
  }
}

namespace ImDataService {
  export interface Config {
    assetPath: string
  }

  export const Config: Schema<Config> = Schema.object({
    assetPath: Schema.string().default('assets/im/'),
  })
}

export default ImDataService
